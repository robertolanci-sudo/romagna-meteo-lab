import { describe, expect, it } from 'vitest';
import { rankModels } from './model-battle.js';

describe('model battle', () => {
  it('ranks by metric and exposes lead, period, sample and coverage', () => {
    const rows = rankModels([
      {
        model: 'ICON',
        leadBucket: '0-6h',
        period: '30d',
        locationId: 'seed-1',
        variable: 'temperature_2m',
        samples: [
          { forecast: 3, observed: 1 },
          { forecast: 3, observed: 2 },
          { forecast: 5, observed: 4 },
        ],
      },
      {
        model: 'ECMWF',
        leadBucket: '0-6h',
        period: '30d',
        locationId: 'seed-1',
        variable: 'temperature_2m',
        samples: [
          { forecast: 2, observed: 1 },
          { forecast: 3, observed: 2 },
          { forecast: 4, observed: 4 },
        ],
      },
    ]);
    expect(rows[0]).toMatchObject({
      model: 'ECMWF',
      metric: 'mae',
      sampleCount: 3,
      coverage: 'complete',
      published: true,
    });
  });
});
