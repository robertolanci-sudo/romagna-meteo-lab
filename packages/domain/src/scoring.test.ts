import { describe, expect, it } from 'vitest';
import { circularDirectionError, scoreSamples } from './scoring.js';

describe('scoring engine', () => {
  it('withholds scores below minimum sample size and calculates metrics', () => {
    expect(scoreSamples([{ forecast: 2, observed: 1 }], 3).every((score) => !score.published)).toBe(
      true,
    );
    const scores = scoreSamples([
      { forecast: 2, observed: 1, probability: 0.8 },
      { forecast: 4, observed: 3, probability: 0.7 },
      { forecast: 5, observed: 4, probability: 0.9 },
    ]);
    expect(scores.find((score) => score.metric === 'mae')?.value).toBe(1);
    expect(scores.find((score) => score.metric === 'bias')?.value).toBe(1);
  });

  it('uses circular wind-direction distance', () => {
    expect(circularDirectionError(5, 355)).toBe(10);
  });
});
