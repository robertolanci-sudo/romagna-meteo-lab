export type LocationSlug = 'rimini' | 'riccione' | 'cattolica';

export type SeriesPoint = {
  variable: string;
  validAt: string;
  value: number | null;
  model?: string;
};

export type ForecastPayload = {
  current?: {
    time: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    surface_pressure?: number;
    visibility?: number;
    uv_index?: number;
    weather_code?: number;
  };
  daily?: { sunrise?: string[]; sunset?: string[] };
  data?: SeriesPoint[];
  meta?: { dataset?: string; source?: string; retrievedAt?: string };
};

export type MarinePayload = {
  data?: SeriesPoint[];
  meta?: { source?: string; attribution?: string };
};

export type MapPayload = {
  times: string[];
  points: Array<{
    latitude: number;
    longitude: number;
    precipitation?: Array<number | null>;
    windSpeed?: Array<number | null>;
    windDirection?: Array<number | null>;
  }>;
  meta?: { source?: string; hours?: number; attribution?: string };
};

export type HistoryPayload = {
  annual?: Array<{ year: number }>;
  anniversary?: Array<{
    date: string;
    max: number | null;
    min: number | null;
    mean: number | null;
    precipitation: number | null;
    source?: string;
  }>;
  recent?: Array<{ date: string; max: number | null }>;
  meta?: { dataset?: string; startDate?: string; endDate?: string; attribution?: string };
};

export type ModelDaily = {
  time?: string[];
  temperature_2m_max?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  temperature_2m_mean?: Array<number | null>;
  precipitation_sum?: Array<number | null>;
  weather_code?: Array<number | null>;
};

export type ForecastModel = {
  key: string;
  label: string;
  resolution: string;
  hourly?: {
    temperature_2m?: Array<number | null>;
    precipitation?: Array<number | null>;
  };
  daily?: ModelDaily;
  error?: string | null;
};

export type ModelsPayload = { models?: ForecastModel[] };

export type Unit = 'c' | 'f';
