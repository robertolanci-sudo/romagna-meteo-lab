export const CLIMATE_FORMULA_VERSION = 'climate-aggregate-v1';

type HistoricalPoint = {
  dataset?: string;
  locationId?: string;
  observedAt: string;
  variable: string;
  value: number | null;
  unit?: string;
  source?: string;
  datasetVersion: string;
};

export type ClimateAggregate = {
  period: string;
  variable: string;
  mean: number;
  min: number;
  max: number;
  sampleCount: number;
  baselineMean?: number;
  anomaly?: number;
  datasetVersion: string;
  formulaVersion: string;
};

export function aggregateMonthly(points: HistoricalPoint[]): ClimateAggregate[] {
  const groups = new Map<string, HistoricalPoint[]>();
  for (const point of points) {
    if (point.value == null) continue;
    const key = `${point.observedAt.slice(0, 7)}|${point.variable}`;
    groups.set(key, [...(groups.get(key) ?? []), point]);
  }
  return [...groups.entries()].map(([key, values]) => {
    const [period, variable] = key.split('|');
    const numbers = values.map((value) => value.value as number);
    const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    return {
      period,
      variable,
      mean,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      sampleCount: numbers.length,
      datasetVersion: values[0].datasetVersion,
      formulaVersion: CLIMATE_FORMULA_VERSION,
    };
  });
}

export function withBaselineAnomaly(
  aggregates: ClimateAggregate[],
  baseline: Record<string, number>,
): ClimateAggregate[] {
  return aggregates.map((aggregate) => ({
    ...aggregate,
    baselineMean: baseline[aggregate.variable],
    anomaly:
      baseline[aggregate.variable] == null
        ? undefined
        : aggregate.mean - baseline[aggregate.variable],
  }));
}
