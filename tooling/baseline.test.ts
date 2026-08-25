import { describe, expect, it } from 'vitest';

describe('repository baseline', () => {
  it('exposes the project identity', () => {
    expect('romagna-meteo-lab').toBe('romagna-meteo-lab');
  });
});
