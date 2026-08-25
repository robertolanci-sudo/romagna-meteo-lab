import { describe, expect, it } from 'vitest';
import { locationSchema, provenanceSchema } from './index.js';

describe('canonical contracts', () => {
  it('accepts UTC provenance and rejects local timestamps', () => {
    const valid = provenanceSchema.safeParse({
      source: 'fixture',
      sourceUrl: 'https://example.test/weather',
      dataset: 'test-dataset',
      retrievedAt: '2026-08-25T05:00:00Z',
      licenseRef: 'test-license',
      quality: 'valid',
      attribution: 'Test provider',
    });
    const local = provenanceSchema.safeParse({
      source: 'fixture',
      sourceUrl: 'https://example.test/weather',
      dataset: 'test-dataset',
      retrievedAt: '2026-08-25T05:00:00+02:00',
      licenseRef: 'test-license',
      quality: 'valid',
      attribution: 'Test provider',
    });

    expect(valid.success).toBe(true);
    expect(local.success).toBe(false);
  });

  it('keeps location slugs portable beyond Romagna', () => {
    expect(
      locationSchema.parse({
        id: 'loc-1',
        slug: 'cesena',
        name: 'Cesena',
        latitude: 44.14,
        longitude: 12.24,
        elevationM: 44,
        timezone: 'Europe/Rome',
        region: 'Emilia-Romagna',
      }).slug,
    ).toBe('cesena');
  });
});
