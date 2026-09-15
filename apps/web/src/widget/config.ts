import type { LocationSlug, Unit } from '../types';

export type WidgetTheme = 'dark' | 'light' | 'glass';
export type WidgetLayout = 'compact' | 'card' | 'strip';

export type WidgetConfig = {
  location: LocationSlug;
  theme: WidgetTheme;
  layout: WidgetLayout;
  unit: Unit;
  sea: boolean;
  hours: boolean;
  accent: string;
};

export const DEFAULT_CONFIG: WidgetConfig = {
  location: 'rimini',
  theme: 'dark',
  layout: 'card',
  unit: 'c',
  sea: true,
  hours: true,
  accent: '#4ed6e9',
};

/** Heights the host iframe should reserve before the widget reports its own. */
export const LAYOUT_HEIGHT: Record<WidgetLayout, number> = {
  compact: 132,
  card: 260,
  strip: 200,
};

const LOCATIONS: LocationSlug[] = ['rimini', 'riccione', 'cattolica'];
const THEMES: WidgetTheme[] = ['dark', 'light', 'glass'];
const LAYOUTS: WidgetLayout[] = ['compact', 'card', 'strip'];

const pick = <T extends string>(value: string | null, allowed: T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const flag = (value: string | null, fallback: boolean) =>
  value === null ? fallback : value !== '0' && value !== 'false';

export function parseConfig(search: string): WidgetConfig {
  const params = new URLSearchParams(search);
  const accent = params.get('accent');
  return {
    location: pick(params.get('location'), LOCATIONS, DEFAULT_CONFIG.location),
    theme: pick(params.get('theme'), THEMES, DEFAULT_CONFIG.theme),
    layout: pick(params.get('layout'), LAYOUTS, DEFAULT_CONFIG.layout),
    unit: pick(params.get('unit'), ['c', 'f'] as Unit[], DEFAULT_CONFIG.unit),
    sea: flag(params.get('sea'), DEFAULT_CONFIG.sea),
    hours: flag(params.get('hours'), DEFAULT_CONFIG.hours),
    accent:
      accent && /^#?[0-9a-f]{6}$/i.test(accent)
        ? `#${accent.replace('#', '')}`
        : DEFAULT_CONFIG.accent,
  };
}

export function toQuery(config: WidgetConfig): string {
  const params = new URLSearchParams({
    location: config.location,
    theme: config.theme,
    layout: config.layout,
    unit: config.unit,
    sea: config.sea ? '1' : '0',
    hours: config.hours ? '1' : '0',
    accent: config.accent.replace('#', ''),
  });
  return params.toString();
}

export const THEME_TOKENS: Record<
  WidgetTheme,
  { surface: string; border: string; ink: string; muted: string; faint: string }
> = {
  dark: {
    surface: 'linear-gradient(168deg, rgba(23,28,58,.96), rgba(9,11,26,.96))',
    border: 'rgba(35,42,77,.9)',
    ink: '#eef1ff',
    muted: '#949cbe',
    faint: '#5d6485',
  },
  light: {
    surface: 'linear-gradient(168deg, #ffffff, #f2f4fb)',
    border: 'rgba(16,22,48,.12)',
    ink: '#101630',
    muted: '#4d5578',
    faint: '#7a83a5',
  },
  glass: {
    surface: 'rgba(255,255,255,.08)',
    border: 'rgba(255,255,255,.22)',
    ink: '#ffffff',
    muted: 'rgba(255,255,255,.78)',
    faint: 'rgba(255,255,255,.58)',
  },
};
