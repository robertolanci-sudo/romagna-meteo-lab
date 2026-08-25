import { describe, expect, it } from 'vitest';
import { aggregateMonthly, withBaselineAnomaly } from './climate.js';

describe('climate aggregates', () => {
  it('returns reproducible monthly means and anomalies', () => {
    const aggregates = aggregateMonthly([
      {
        dataset: 'historical-weather',
        locationId: '1',
        observedAt: '2022-01-01T00:00:00Z',
        variable: 'temperature_2m',
        value: 4,
        unit: '°C',
        source: 'x',
        datasetVersion: 'v1',
      },
      {
        dataset: 'historical-weather',
        locationId: '1',
        observedAt: '2022-01-02T00:00:00Z',
        variable: 'temperature_2m',
        value: 6,
        unit: '°C',
        source: 'x',
        datasetVersion: 'v1',
      },
    ]);
    expect(withBaselineAnomaly(aggregates, { temperature_2m: 3 })[0]).toMatchObject({
      mean: 5,
      anomaly: 2,
      formulaVersion: 'climate-aggregate-v1',
    });
  });
});
