export type ForecastTarget = {
  model: string;
  locationId: string;
  variable: string;
  validAt: string;
  leadHours: number;
  value: number | null;
};

export type AlignedSample = ForecastTarget & { observedValue: number };
export type ExcludedSample = ForecastTarget & {
  reason: 'missing-forecast' | 'missing-observation' | 'outside-tolerance';
};

export function alignTargets(
  forecasts: ForecastTarget[],
  observations: Array<{
    locationId: string;
    variable: string;
    observedAt: string;
    value: number | null;
  }>,
  toleranceMinutes = 30,
): { samples: AlignedSample[]; excluded: ExcludedSample[] } {
  const samples: AlignedSample[] = [];
  const excluded: ExcludedSample[] = [];
  for (const forecast of forecasts) {
    if (forecast.value == null) {
      excluded.push({ ...forecast, reason: 'missing-forecast' });
      continue;
    }
    const candidates = observations.filter(
      (observation) =>
        observation.locationId === forecast.locationId &&
        observation.variable === forecast.variable,
    );
    const target = Date.parse(forecast.validAt);
    const nearest = candidates
      .map((observation) => ({
        observation,
        distance: Math.abs(Date.parse(observation.observedAt) - target),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (!nearest || nearest.observation.value == null) {
      excluded.push({ ...forecast, reason: 'missing-observation' });
    } else if (nearest.distance > toleranceMinutes * 60_000) {
      excluded.push({ ...forecast, reason: 'outside-tolerance' });
    } else {
      samples.push({ ...forecast, observedValue: nearest.observation.value });
    }
  }
  return { samples, excluded };
}
