import { describe, expect, it } from 'vitest';
import { findLocation } from '@romagna-meteo/domain';
import { OpenMeteoMarineAdapter } from './open-meteo-marine.js';

describe('marine adapter', () => {
  it('normalizes marine variables and explicit grid metadata', async () => {
    const location = findLocation('rimini');
    if (!location) throw new Error('Rimini seed missing');
    const adapter = new OpenMeteoMarineAdapter({
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
    });
    const series = await adapter.fetch(location, 'nearest');
    expect(series.values).toHaveLength(5);
    expect(series.values[0].gridMode).toBe('nearest');
    expect(series.coastalLimitation).toContain('offshore');
  });
});
