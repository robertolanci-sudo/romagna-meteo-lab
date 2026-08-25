import { describe, expect, it } from 'vitest';
import { alignTargets } from './alignment.js';

describe('forecast target alignment', () => {
  it('matches within tolerance and records exclusions', () => {
    const result = alignTargets(
      [
        {
          model: 'm',
          locationId: '1',
          variable: 'temperature_2m',
          validAt: '2026-01-01T00:00:00Z',
          leadHours: 1,
          value: 4,
        },
        {
          model: 'm',
          locationId: '1',
          variable: 'temperature_2m',
          validAt: '2026-01-01T02:00:00Z',
          leadHours: 3,
          value: 5,
        },
      ],
      [
        {
          locationId: '1',
          variable: 'temperature_2m',
          observedAt: '2026-01-01T00:10:00Z',
          value: 3,
        },
      ],
    );
    expect(result.samples).toHaveLength(1);
    expect(result.excluded[0].reason).toBe('outside-tolerance');
  });
});
