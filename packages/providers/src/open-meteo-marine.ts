import { marineSeriesSchema, type Location, type MarineSeries } from '@romagna-meteo/contracts';
import { ProviderError } from './open-meteo.js';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const variables = [
  ['sea_surface_temperature', 'sea_surface_temperature', '°C'],
  ['wave_height', 'wave_height', 'm'],
  ['wave_direction', 'wave_direction', '°'],
  ['wave_period', 'wave_period', 's'],
  ['wind_wave_height', 'wind_wave_height', 'm'],
] as const;

export class OpenMeteoMarineAdapter {
  constructor(
    private readonly options: { baseUrl?: string; fetcher?: FetchLike; now?: () => Date } = {},
  ) {}

  async fetch(
    location: Location,
    gridMode: 'sea' | 'nearest' | 'land' = 'sea',
  ): Promise<MarineSeries> {
    const url = new URL(this.options.baseUrl ?? 'https://marine-api.open-meteo.com/v1/marine');
    url.searchParams.set('latitude', String(location.latitude));
    url.searchParams.set('longitude', String(location.longitude));
    url.searchParams.set('hourly', variables.map(([, name]) => name).join(','));
    url.searchParams.set('timezone', 'UTC');
    const response = await (this.options.fetcher ?? fetch)(url.toString(), {
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new ProviderError(`Open-Meteo Marine HTTP ${response.status}`, 'http');
    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== 'object' ||
      !Array.isArray((payload as { hourly?: { time?: unknown } }).hourly?.time)
    ) {
      throw new ProviderError('Malformed Open-Meteo Marine payload', 'schema');
    }
    const hourly = (payload as { hourly: Record<string, unknown[]> }).hourly;
    const times = hourly.time as string[];
    const values = variables.flatMap(([key, name, unit]) =>
      (Array.isArray(hourly[name]) ? hourly[name] : []).map((value, index) => ({
        validAt: `${times[index]}:00Z`,
        variable: key,
        value: typeof value === 'number' && Number.isFinite(value) ? value : null,
        unit,
        gridMode,
      })),
    );
    const retrievedAt = (this.options.now?.() ?? new Date()).toISOString();
    return marineSeriesSchema.parse({
      location,
      values,
      coastalLimitation:
        'Marine model grid is offshore; near-shore values are indicative and not beach observations.',
      provenance: {
        source: 'open-meteo-marine',
        sourceUrl: url.toString(),
        dataset: 'open-meteo-marine',
        retrievedAt,
        licenseRef: 'open-meteo-cc-by-4.0',
        quality: gridMode === 'land' ? 'partial' : 'valid',
        attribution: 'Marine data by Open-Meteo.com; upstream Copernicus Marine where applicable',
      },
    });
  }
}
