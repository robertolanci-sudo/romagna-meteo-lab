export type ScoreSample = {
  forecast: number;
  observed: number;
  probability?: number;
  leadHours?: number;
  locationId?: string;
  variable?: string;
};
export type Score = {
  metric: string;
  value: number | null;
  sampleCount: number;
  minimumSampleCount: number;
  published: boolean;
  slices: Record<string, string | number | undefined>;
};

export function scoreSamples(samples: ScoreSample[], minimumSampleCount = 3): Score[] {
  const published = samples.length >= minimumSampleCount;
  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const errors = samples.map((sample) => sample.forecast - sample.observed);
  const probabilities = samples
    .filter((sample) => sample.probability != null)
    .map((sample) => ((sample.probability as number) - sample.observed) ** 2);
  return [
    {
      metric: 'mae',
      value: published ? mean(errors.map(Math.abs)) : null,
      sampleCount: samples.length,
      minimumSampleCount,
      published,
      slices: {},
    },
    {
      metric: 'rmse',
      value: published ? Math.sqrt(mean(errors.map((error) => error ** 2))) : null,
      sampleCount: samples.length,
      minimumSampleCount,
      published,
      slices: {},
    },
    {
      metric: 'bias',
      value: published ? mean(errors) : null,
      sampleCount: samples.length,
      minimumSampleCount,
      published,
      slices: {},
    },
    {
      metric: 'brier',
      value: published && probabilities.length >= minimumSampleCount ? mean(probabilities) : null,
      sampleCount: probabilities.length,
      minimumSampleCount,
      published: probabilities.length >= minimumSampleCount,
      slices: {},
    },
  ];
}

export function circularDirectionError(forecast: number, observed: number): number {
  return Math.abs(((forecast - observed + 540) % 360) - 180);
}
