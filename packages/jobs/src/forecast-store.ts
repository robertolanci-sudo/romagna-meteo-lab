import type { ForecastSeries, WeatherValue } from '@romagna-meteo/contracts';

export type StoredForecastPoint = WeatherValue & {
  locationId: string;
  runId: string;
  model: string;
  retrievedAt: string;
  parserVersion: string;
  provenance: ForecastSeries['provenance'];
};

export type ForecastQuery = {
  locationId: string;
  model?: string;
  variable?: string;
  from?: string;
  to?: string;
};

export class ForecastStore {
  private readonly points = new Map<string, StoredForecastPoint>();

  upsert(series: ForecastSeries): { inserted: number; updated: number } {
    let inserted = 0;
    let updated = 0;
    for (const value of series.values) {
      const point = toStoredPoint(series, value);
      const key = [point.locationId, point.runId, point.validAt, point.variable].join('|');
      if (this.points.has(key)) updated += 1;
      else inserted += 1;
      this.points.set(key, point);
    }
    return { inserted, updated };
  }

  query(query: ForecastQuery): StoredForecastPoint[] {
    return [...this.points.values()]
      .filter((point) => point.locationId === query.locationId)
      .filter((point) => !query.model || point.model === query.model)
      .filter((point) => !query.variable || point.variable === query.variable)
      .filter((point) => !query.from || point.validAt >= query.from)
      .filter((point) => !query.to || point.validAt <= query.to)
      .sort((a, b) => a.validAt.localeCompare(b.validAt));
  }

  get size(): number {
    return this.points.size;
  }
}

function toStoredPoint(series: ForecastSeries, value: WeatherValue): StoredForecastPoint {
  return {
    ...value,
    locationId: series.location.id,
    runId: series.run.id,
    model: series.run.model,
    retrievedAt: series.provenance.retrievedAt,
    parserVersion: series.run.parserVersion,
    provenance: series.provenance,
  };
}
