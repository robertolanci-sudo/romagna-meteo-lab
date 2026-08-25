import { parseWidgetConfig, renderStaleState, type WidgetConfig } from './config.js';

export function renderWidget(
  container: HTMLElement,
  configInput: unknown,
  data?: { temperature?: number; updatedAt?: string; stale?: boolean },
): void {
  const config = parseWidgetConfig(configInput);
  container.replaceChildren();
  const root = container.attachShadow ? container.attachShadow({ mode: 'open' }) : container;
  const card = document.createElement('article');
  card.style.cssText = `font:14px system-ui,sans-serif;color:#eef1ff;background:${config.theme.palette.surface};border:1px solid ${config.theme.palette.accent};border-radius:14px;padding:16px;max-width:280px`;
  const title = document.createElement('strong');
  title.textContent = config.location;
  card.append(title);
  const body = document.createElement('p');
  body.textContent = data?.stale
    ? renderStaleState(data.updatedAt)
    : data?.temperature == null
      ? 'Nessun dato disponibile.'
      : `${data.temperature} °C`;
  card.append(body);
  root.append(card);
}

export function scriptEmbed(config: WidgetConfig): string {
  const safe = JSON.stringify(config).replace(/</g, '\\u003c');
  return `<div data-romagna-meteo-widget='${safe}'></div><script defer src="/widget.js"></script>`;
}

export function iframeEmbed(config: WidgetConfig, origin: string): string {
  const encoded = encodeURIComponent(JSON.stringify(config));
  return `<iframe title="Romagna Meteo ${config.location}" loading="lazy" sandbox="allow-scripts" src="${origin}/embed?config=${encoded}"></iframe>`;
}
