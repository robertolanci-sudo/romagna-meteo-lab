import { describe, expect, it } from 'vitest';
import { OpenMeteoForecastAdapter } from '@romagna-meteo/providers';
import { findLocation } from '@romagna-meteo/domain';
import { ForecastStore } from './forecast-store.js';

describe('ForecastStore', () => {
  it('upserts idempotently and queries run metadata', async () => {
    const location = findLocation('rimini');
    if (!location) throw new Error('Rimini seed missing');
    const series = await new OpenMeteoForecastAdapter({
      fetcher: async () =>
        new Response(
          JSON.stringify({
            hourly: {
              time: ['2026-08-25T00:00'],
              temperature_2m: [24],
              precipitation: [0],
              wind_speed_10m: [8],
            },
          }),
          { status: 200 },
        ),
    }).fetch(location, 'ecmwf_ifs04');
    const store = new ForecastStore();
    expect(store.upsert(series)).toEqual({ inserted: 3, updated: 0 });
    expect(store.upsert(series)).toEqual({ inserted: 0, updated: 3 });
    expect(store.query({ locationId: location.id, variable: 'temperature_2m' })[0]).toMatchObject({
      model: 'ecmwf_ifs04',
      leadHours: 0,
      parserVersion: 'open-meteo-v1',
    });
  });
});
