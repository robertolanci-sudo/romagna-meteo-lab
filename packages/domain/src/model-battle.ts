import type { Score, ScoreSample } from './scoring.js';
import { scoreSamples } from './scoring.js';

export type ModelBattleInput = {
  model: string;
  samples: ScoreSample[];
  leadBucket: string;
  period: string;
  locationId: string;
  variable: string;
};
export type ModelBattleRow = {
  model: string;
  metric: string;
  score: number | null;
  sampleCount: number;
  leadBucket: string;
  period: string;
  locationId: string;
  variable: string;
  published: boolean;
  coverage: 'complete' | 'incomplete';
};

export function rankModels(inputs: ModelBattleInput[], metric = 'mae'): ModelBattleRow[] {
  return inputs
    .map((input) => {
      const score: Score | undefined = scoreSamples(input.samples).find(
        (candidate) => candidate.metric === metric,
      );
      return {
        model: input.model,
        metric,
        score: score?.value ?? null,
        sampleCount: score?.sampleCount ?? 0,
        leadBucket: input.leadBucket,
        period: input.period,
        locationId: input.locationId,
        variable: input.variable,
        published: score?.published ?? false,
        coverage: input.samples.length >= 3 ? ('complete' as const) : ('incomplete' as const),
      };
    })
    .sort((a, b) => (a.score ?? Number.POSITIVE_INFINITY) - (b.score ?? Number.POSITIVE_INFINITY));
}
