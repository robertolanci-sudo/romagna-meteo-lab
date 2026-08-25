import { iframeEmbed, scriptEmbed } from './runtime.js';
import { parseWidgetConfig } from './config.js';
import type { WidgetConfig } from './config.js';

export function buildPreview(input: unknown): WidgetConfig {
  const encoded = JSON.stringify(input);
  if (encoded.length > 8_192) throw new Error('Widget configuration exceeds 8 KB');
  return parseWidgetConfig(input);
}

export function embedCode(
  input: unknown,
  mode: 'script' | 'iframe',
  origin = 'https://weather.example',
): string {
  const config = buildPreview(input);
  return mode === 'script' ? scriptEmbed(config) : iframeEmbed(config, origin);
}
