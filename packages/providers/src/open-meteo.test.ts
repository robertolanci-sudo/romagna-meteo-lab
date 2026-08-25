import { describe, expect, it } from 'vitest';
import { OpenMeteoForecastAdapter, ProviderError, configuredModels } from './open-meteo.js';
import { findLocation } from '@romagna-meteo/domain';

const location = findLocation('rimini');
if (!location) throw new Error('Rimini seed missing');

const fixture = {
  hourly: {
    time: ['2026-08-25T00:00', '2026-08-25T01:00'],
    temperature_2m: [24, 23.5],
    precipitation: [0, 0.2],
    wind_speed_10m: [8, 9],
  },
};

describe('Open-Meteo forecast adapter', () => {
  it('normalizes three configured models into the canonical series', async () => {
    for (const model of configuredModels) {
      const adapter = new OpenMeteoForecastAdapter({
        fetcher: async () => new Response(JSON.stringify(fixture), { status: 200 }),
        now: () => new Date('2026-08-25T05:00:00Z'),
      });
      const result = await adapter.fetch(location, model.key);
      expect(result.run.model).toBe(model.key);
      expect(result.provenance.retrievedAt).toBe('2026-08-25T05:00:00.000Z');
      expect(result.values).toHaveLength(6);
    }
  });

  it('classifies malformed responses and retries timeouts', async () => {
    const adapter = new OpenMeteoForecastAdapter({
      retries: 1,
      timeoutMs: 1,
      fetcher: async () => new Response('{}', { status: 200 }),
    });
    await expect(adapter.fetch(location, configuredModels[0].key)).rejects.toMatchObject({
      code: 'schema',
    });
  });
});
