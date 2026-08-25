import { describe, expect, it } from 'vitest';
import { findLocation, romagnaLocations, searchLocations } from './locations.js';

describe('Romagna location catalog', () => {
  it('contains coastal and inland seed points', () => {
    expect(romagnaLocations).toHaveLength(10);
    expect(findLocation('rimini')?.longitude).toBeCloseTo(12.5683);
    expect(findLocation('cesena')?.elevationM).toBe(44);
  });

  it('searches by localized name or slug', () => {
    expect(searchLocations('Forlì').map((location) => location.slug)).toEqual(['forli']);
    expect(searchLocations('marina')).toHaveLength(1);
  });
});
