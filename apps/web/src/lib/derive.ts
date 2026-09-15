import { isRainCode } from './format';
import type { ForecastModel, ForecastPayload, MarinePayload, SeriesPoint } from '../types';

export type HourSlot = {
  validAt: string;
  temperature: number;
  precipitation: number | null;
  wind: number | null;
  code: number;
  rainExpected: boolean;
};

const indexBy = (data: SeriesPoint[] | undefined, variable: string) =>
  new Map(
    (data ?? [])
      .filter((point) => point.variable === variable)
      .map((point) => [point.validAt, point.value] as const),
  );

/** Collapse the flat variable series into one row per hour. */
export function hourSlots(payload: ForecastPayload | null, limit = 24): HourSlot[] {
  if (!payload) return [];
  const rain = indexBy(payload.data, 'precipitation');
  const wind = indexBy(payload.data, 'wind_speed_10m');
  const codes = indexBy(payload.data, 'weather_code');
  return (payload.data ?? [])
    .filter((point) => point.variable === 'temperature_2m' && typeof point.value === 'number')
    .slice(0, limit)
    .map((point) => {
      const code = Number(codes.get(point.validAt) ?? 0);
      const precipitation = rain.get(point.validAt);
      return {
        validAt: point.validAt,
        temperature: point.value as number,
        precipitation: typeof precipitation === 'number' ? precipitation : null,
        wind:
          typeof wind.get(point.validAt) === 'number' ? (wind.get(point.validAt) as number) : null,
        code,
        rainExpected:
          (typeof precipitation === 'number' && precipitation >= 0.1) || isRainCode(code),
      };
    });
}

export type RainOutlook = {
  next: HourSlot | null;
  totalMm: number;
  hoursWithRain: number;
};

export function rainOutlook(slots: HourSlot[]): RainOutlook {
  const window = slots.slice(0, 24);
  const wet = window.filter((slot) => slot.rainExpected);
  return {
    next: wet[0] ?? null,
    totalMm: wet.reduce((sum, slot) => sum + (slot.precipitation ?? 0), 0),
    hoursWithRain: wet.length,
  };
}

const mean = (values: Array<number | null | undefined>) => {
  const numbers = values.filter((value): value is number => typeof value === 'number');
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null;
};

export type DayConsensus = {
  date: string;
  max: number | null;
  min: number | null;
  average: number | null;
  precipitation: number | null;
  code: number;
  spread: number | null;
};

/** Average the member models into one readable daily series. */
export function dayConsensus(models: ForecastModel[] | undefined, limit = 14): DayConsensus[] {
  const valid = (models ?? []).filter((model) => model.daily?.time?.length);
  const days = valid[0]?.daily?.time ?? [];
  return days.slice(0, limit).map((date, index) => {
    const maxima = valid
      .map((model) => model.daily?.temperature_2m_max?.[index])
      .filter((value): value is number => typeof value === 'number');
    return {
      date,
      max: mean(maxima),
      min: mean(valid.map((model) => model.daily?.temperature_2m_min?.[index])),
      average: mean(valid.map((model) => model.daily?.temperature_2m_mean?.[index])),
      precipitation: mean(valid.map((model) => model.daily?.precipitation_sum?.[index])),
      code: Number(
        valid.find((model) => typeof model.daily?.weather_code?.[index] === 'number')?.daily
          ?.weather_code?.[index] ?? 0,
      ),
      spread: maxima.length > 1 ? Math.max(...maxima) - Math.min(...maxima) : null,
    };
  });
}

export type ModelSummary = {
  key: string;
  label: string;
  resolution: string;
  min: number | null;
  max: number | null;
  rain24h: number;
  code: number;
};

export function modelSummaries(models: ForecastModel[] | undefined): ModelSummary[] {
  return (models ?? [])
    .filter((model) => (model.hourly?.temperature_2m ?? []).length)
    .map((model) => {
      const values = (model.hourly?.temperature_2m ?? [])
        .slice(0, 24)
        .filter((value): value is number => typeof value === 'number');
      return {
        key: model.key,
        label: model.label,
        resolution: model.resolution,
        min: values.length ? Math.min(...values) : null,
        max: values.length ? Math.max(...values) : null,
        rain24h: (model.hourly?.precipitation ?? [])
          .slice(0, 24)
          .filter((value): value is number => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0),
        code: Number(model.daily?.weather_code?.[0] ?? 0),
      };
    });
}

export type MarineNow = {
  sst: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  rows: Array<{ validAt: string; values: Record<string, number | null> }>;
};

export function marineNow(payload: MarinePayload | null): MarineNow {
  const first = (variable: string) =>
    (payload?.data ?? []).find(
      (point) => point.variable === variable && typeof point.value === 'number',
    )?.value ?? null;

  const grouped = new Map<string, Record<string, number | null>>();
  (payload?.data ?? []).forEach((point) => {
    const bucket = grouped.get(point.validAt) ?? {};
    bucket[point.variable] = point.value;
    grouped.set(point.validAt, bucket);
  });

  return {
    sst: first('sea_surface_temperature'),
    waveHeight: first('wave_height'),
    waveDirection: first('wave_direction'),
    wavePeriod: first('wave_period'),
    rows: [...grouped.entries()].slice(0, 10).map(([validAt, values]) => ({ validAt, values })),
  };
}
