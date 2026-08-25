import { describe, expect, it } from 'vitest';
import { HistoryStore, importHistoryInChunks, type HistoricalPoint } from './history.js';

const rows: HistoricalPoint[] = [
  {
    dataset: 'historical-weather',
    locationId: 'seed-1',
    observedAt: '2022-01-01T00:00:00Z',
    variable: 'temperature_2m',
    value: 4,
    unit: '°C',
    source: 'fixture-weather',
    datasetVersion: 'v1',
  },
  {
    dataset: 'historical-forecast',
    locationId: 'seed-1',
    observedAt: '2022-01-01T00:00:00Z',
    variable: 'temperature_2m',
    value: 3,
    unit: '°C',
    source: 'fixture-forecast',
    datasetVersion: 'v1',
  },
];

describe('historical importer', () => {
  it('imports chunks idempotently and keeps datasets separate', async () => {
    const store = new HistoryStore();
    expect(await importHistoryInChunks(rows, store, 1)).toMatchObject({ inserted: 2, chunks: 2 });
    expect(await importHistoryInChunks(rows, store, 1)).toMatchObject({
      inserted: 0,
      updated: 2,
      chunks: 2,
    });
    expect(store.query('historical-weather', 'seed-1')[0].value).toBe(4);
    expect(store.query('historical-forecast', 'seed-1')[0].value).toBe(3);
  });
});
