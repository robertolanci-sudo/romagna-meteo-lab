export type HistoryDataset = 'historical-weather' | 'historical-forecast';

export type HistoricalPoint = {
  dataset: HistoryDataset;
  locationId: string;
  observedAt: string;
  variable: string;
  value: number | null;
  unit: string;
  source: string;
  datasetVersion: string;
};

export class HistoryStore {
  private readonly points = new Map<string, HistoricalPoint>();

  upsert(points: HistoricalPoint[]): { inserted: number; updated: number } {
    let inserted = 0;
    let updated = 0;
    for (const point of points) {
      const key = [point.dataset, point.locationId, point.observedAt, point.variable].join('|');
      if (this.points.has(key)) updated += 1;
      else inserted += 1;
      this.points.set(key, point);
    }
    return { inserted, updated };
  }

  query(dataset: HistoryDataset, locationId: string): HistoricalPoint[] {
    return [...this.points.values()]
      .filter((point) => point.dataset === dataset && point.locationId === locationId)
      .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  }
}

export async function importHistoryInChunks(
  rows: HistoricalPoint[],
  store: HistoryStore,
  chunkSize = 500,
): Promise<{ inserted: number; updated: number; chunks: number }> {
  let inserted = 0;
  let updated = 0;
  let chunks = 0;
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const result = store.upsert(rows.slice(offset, offset + chunkSize));
    inserted += result.inserted;
    updated += result.updated;
    chunks += 1;
  }
  return { inserted, updated, chunks };
}
