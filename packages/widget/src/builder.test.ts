import { describe, expect, it } from 'vitest';
import { buildPreview, embedCode } from './builder.js';

describe('widget builder', () => {
  it('builds validated previews and safe embed code', () => {
    const config = buildPreview({ version: 1, location: 'rimini', fields: ['temperature'] });
    expect(config.location).toBe('rimini');
    expect(embedCode(config, 'script')).toContain('<script');
    expect(embedCode(config, 'iframe')).toContain('sandbox');
  });

  it('rejects oversized configuration', () => {
    expect(() => buildPreview({ version: 1, location: 'rimini', logo: 'x'.repeat(9_000) })).toThrow(
      '8 KB',
    );
  });
});
