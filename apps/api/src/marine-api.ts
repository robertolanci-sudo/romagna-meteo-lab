import { findLocation } from '@romagna-meteo/domain';
import { OpenMeteoMarineAdapter } from '@romagna-meteo/providers';

export const BEACH_SCORE_FORMULA_VERSION = 'beach-score-v1';

export class MarineApi {
  constructor(private readonly adapter = new OpenMeteoMarineAdapter()) {}

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const location = parts[2] ? findLocation(parts[2]) : undefined;
    if (parts[0] !== 'v1' || parts[1] !== 'locations' || parts[3] !== 'marine') {
      return json({ error: 'not_found' }, 404);
    }
    if (!location) return json({ error: 'location_not_found' }, 404);
    const gridMode = (url.searchParams.get('grid') ?? 'sea') as 'sea' | 'nearest' | 'land';
    if (!['sea', 'nearest', 'land'].includes(gridMode))
      return json({ error: 'invalid_grid_mode' }, 400);
    try {
      const series = await this.adapter.fetch(location, gridMode);
      const score = beachScore(series.values);
      return json({
        data: series.values,
        derived: {
          beachScore: score,
          formulaVersion: BEACH_SCORE_FORMULA_VERSION,
          label: 'calcolo proprietario, non previsione ufficiale',
        },
        meta: { ...series.provenance, coastalLimitation: series.coastalLimitation },
      });
    } catch (error) {
      return json(
        {
          error: 'provider_unavailable',
          detail: error instanceof Error ? error.message : 'unknown',
        },
        502,
      );
    }
  }
}

function beachScore(values: Array<{ variable: string; value: number | null }>): number | null {
  const wave = values.find((value) => value.variable === 'wave_height')?.value;
  const windWave = values.find((value) => value.variable === 'wind_wave_height')?.value;
  if (wave == null || windWave == null) return null;
  return Math.max(0, Math.min(100, Math.round(100 - wave * 45 - windWave * 25)));
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
