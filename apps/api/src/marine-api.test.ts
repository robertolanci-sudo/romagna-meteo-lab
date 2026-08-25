import { describe, expect, it } from 'vitest';
import { OpenMeteoMarineAdapter } from '@romagna-meteo/providers';
import { MarineApi } from './marine-api.js';

describe('marine API', () => {
  it('returns derived score with formula provenance', async () => {
    const api = new MarineApi(
      new OpenMeteoMarineAdapter({
        fetcher: async () =>
          new Response(
            JSON.stringify({
              hourly: {
                time: ['2026-08-25T00:00'],
                sea_surface_temperature: [26],
                wave_height: [0.4],
                wave_direction: [120],
                wave_period: [5],
                wind_wave_height: [0.2],
              },
            }),
            { status: 200 },
          ),
      }),
    );
    const response = await api.handle(
      new Request('https://lab.test/v1/locations/rimini/marine?grid=nearest'),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.derived.formulaVersion).toBe('beach-score-v1');
    expect(body.meta.coastalLimitation).toContain('offshore');
  });
});
