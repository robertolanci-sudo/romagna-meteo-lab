import type {
  ForecastPayload,
  HistoryPayload,
  LocationSlug,
  MapPayload,
  MarinePayload,
  ModelsPayload,
} from '../types';

const headers = { 'x-client-id': 'dashboard' };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers });
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  return (await response.json()) as T;
}

export const fetchForecast = (slug: LocationSlug) =>
  getJson<ForecastPayload>(`/api/v1/locations/${slug}/forecast?variables=temperature_2m`);

export const fetchMarine = (slug: LocationSlug) =>
  getJson<MarinePayload>(`/api/v1/locations/${slug}/marine?grid=sea`);

export const fetchModels = (slug: LocationSlug) =>
  getJson<ModelsPayload>(`/api/v1/locations/${slug}/forecast-models`);

export const fetchHistory = (slug: LocationSlug) =>
  getJson<HistoryPayload>(`/api/v1/locations/${slug}/history`);

export const fetchMap = (hours = 24) => getJson<MapPayload>(`/api/v1/map?hours=${hours}`);

export const LOCATIONS: Array<{ slug: LocationSlug; label: string; coords: string }> = [
  { slug: 'rimini', label: 'Rimini', coords: '44.06°N · 12.57°E' },
  { slug: 'riccione', label: 'Riccione', coords: '44.00°N · 12.66°E' },
  { slug: 'cattolica', label: 'Cattolica', coords: '43.96°N · 12.74°E' },
];
