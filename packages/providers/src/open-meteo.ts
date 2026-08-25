import { forecastSeriesSchema, type ForecastSeries, type Location } from '@romagna-meteo/contracts';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type OpenMeteoHourly = {
  time?: unknown;
  temperature_2m?: unknown;
  precipitation?: unknown;
  wind_speed_10m?: unknown;
};

type OpenMeteoResponse = {
  latitude?: unknown;
  longitude?: unknown;
  generationtime_ms?: unknown;
  hourly?: OpenMeteoHourly;
};

export const configuredModels = [
  { key: 'ecmwf_ifs04', displayName: 'ECMWF IFS', resolutionM: 9000 },
  { key: 'icon_eu', displayName: 'DWD ICON-EU', resolutionM: 7000 },
  { key: 'meteofrance_seamless', displayName: 'Météo-France', resolutionM: 9000 },
] as const;

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly code: 'timeout' | 'http' | 'schema' | 'network',
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class OpenMeteoForecastAdapter {
  constructor(
    private readonly options: {
      baseUrl?: string;
      fetcher?: FetchLike;
      timeoutMs?: number;
      retries?: number;
      now?: () => Date;
    } = {},
  ) {}

  async fetch(location: Location, modelKey: string): Promise<ForecastSeries> {
    const model = configuredModels.find((candidate) => candidate.key === modelKey);
    if (!model) throw new ProviderError(`Unsupported model: ${modelKey}`, 'schema');

    const baseUrl = this.options.baseUrl ?? 'https://api.open-meteo.com/v1/forecast';
    const url = new URL(baseUrl);
    url.searchParams.set('latitude', String(location.latitude));
    url.searchParams.set('longitude', String(location.longitude));
    url.searchParams.set('hourly', 'temperature_2m,precipitation,wind_speed_10m');
    url.searchParams.set('models', model.key);
    url.searchParams.set('timezone', 'UTC');

    const payload = await this.request(url.toString());
    return normalize(payload, location, model, url.toString(), this.options.now?.() ?? new Date());
  }

  private async request(url: string): Promise<OpenMeteoResponse> {
    const fetcher = this.options.fetcher ?? fetch;
    const retries = this.options.retries ?? 2;
    const timeoutMs = this.options.timeoutMs ?? 8_000;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetcher(url, { signal: controller.signal });
        if (!response.ok) throw new ProviderError(`Open-Meteo HTTP ${response.status}`, 'http');
        const json: unknown = await response.json();
        if (!isPayload(json)) throw new ProviderError('Malformed Open-Meteo payload', 'schema');
        return json;
      } catch (error) {
        lastError =
          error instanceof ProviderError
            ? error
            : error instanceof DOMException && error.name === 'AbortError'
              ? new ProviderError('Open-Meteo request timed out', 'timeout')
              : new ProviderError('Open-Meteo network failure', 'network');
        if (lastError instanceof ProviderError && ['http', 'schema'].includes(lastError.code))
          break;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError ?? new ProviderError('Open-Meteo request failed', 'network');
  }
}

function isPayload(value: unknown): value is OpenMeteoResponse {
  if (!value || typeof value !== 'object') return false;
  const hourly = (value as OpenMeteoResponse).hourly;
  return !!hourly && Array.isArray(hourly.time);
}

function normalize(
  payload: OpenMeteoResponse,
  location: Location,
  model: (typeof configuredModels)[number],
  sourceUrl: string,
  retrievedAt: Date,
): ForecastSeries {
  const hourly = payload.hourly as Required<OpenMeteoHourly>;
  const times = hourly.time as string[];
  const variables = [
    ['temperature_2m', hourly.temperature_2m, '°C'],
    ['precipitation', hourly.precipitation, 'mm'],
    ['wind_speed_10m', hourly.wind_speed_10m, 'km/h'],
  ] as const;
  const values = variables.flatMap(([variable, raw, unit]) =>
    (Array.isArray(raw) ? raw : []).map((value, index) => ({
      validAt: `${times[index]}:00Z`,
      leadHours: index,
      variable,
      value: typeof value === 'number' && Number.isFinite(value) ? value : null,
      unit,
      aggregation: 'instant' as const,
    })),
  );
  const initializedAt = `${times[0]}:00Z`;
  const validTo = `${times.at(-1)}:00Z`;
  return forecastSeriesSchema.parse({
    location,
    run: {
      id: `${model.key}-${initializedAt}`,
      model: model.key,
      initializedAt,
      publishedAt: retrievedAt.toISOString(),
      validFrom: initializedAt,
      validTo,
      sourceUri: sourceUrl,
      checksum: 'not-computed-fixture',
      parserVersion: 'open-meteo-v1',
    },
    values,
    provenance: {
      source: 'open-meteo',
      sourceUrl,
      dataset: model.key,
      retrievedAt: retrievedAt.toISOString(),
      providerRunAt: initializedAt,
      licenseRef: 'open-meteo-cc-by-4.0',
      resolutionM: model.resolutionM,
      quality: 'valid',
      attribution: 'Weather data by Open-Meteo.com',
    },
  });
}
