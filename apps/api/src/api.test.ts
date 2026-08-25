import { describe, expect, it } from 'vitest';
import { OpenMeteoForecastAdapter } from '@romagna-meteo/providers';
import { findLocation } from '@romagna-meteo/domain';
import { ForecastStore } from '@romagna-meteo/jobs';
import { ForecastApi } from './api.js';

describe('forecast API v1', () => {
  it('returns provenance-backed forecast and model compare responses', async () => {
    const location = findLocation('rimini');
    if (!location) throw new Error('Rimini seed missing');
    const adapter = new OpenMeteoForecastAdapter({
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
    });
    const store = new ForecastStore();
    store.upsert(await adapter.fetch(location, 'ecmwf_ifs04'));
    const api = new ForecastApi(store, { now: () => new Date('2026-08-25T05:00:00Z') });
    const response = await api.handle(
      new Request('https://lab.test/v1/locations/rimini/forecast?variables=temperature_2m', {
        headers: { 'x-client-id': 'test' },
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.meta.source).toBe('open-meteo');

    const compare = await api.handle(
      new Request('https://lab.test/v1/locations/rimini/models/compare?variable=temperature_2m', {
        headers: { 'x-client-id': 'test' },
      }),
    );
    expect((await compare.json()).data[0].model).toBe('ecmwf_ifs04');
  });

  it('enforces a per-client rate limit', async () => {
    const api = new ForecastApi(new ForecastStore(), { rateLimit: 1 });
    const request = () =>
      api.handle(
        new Request('https://lab.test/v1/locations?q=rimini', {
          headers: { 'x-client-id': 'test' },
        }),
      );
    expect((await request()).status).toBe(200);
    expect((await request()).status).toBe(429);
  });
});
