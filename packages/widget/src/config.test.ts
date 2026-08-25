import { describe, expect, it } from 'vitest';
import { iframeEmbed, parseWidgetConfig, scriptEmbed } from './index.js';

const config = {
  version: 1 as const,
  location: 'rimini',
  fields: ['temperature' as const, 'updatedAt' as const],
};

describe('widget runtime', () => {
  it('validates versioned config and emits safe embed snippets', () => {
    const parsed = parseWidgetConfig(config);
    expect(parsed.theme.palette.accent).toBe('#4ed6e9');
    expect(scriptEmbed(parsed)).toContain('data-romagna-meteo-widget');
    expect(iframeEmbed(parsed, 'https://weather.example')).toContain('sandbox="allow-scripts"');
  });

  it('rejects unsafe location values', () => {
    expect(() => parseWidgetConfig({ ...config, location: '<script>' })).toThrow();
  });
});
