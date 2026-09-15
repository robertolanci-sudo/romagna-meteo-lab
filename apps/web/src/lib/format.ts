import type { Unit } from '../types';

const TZ = 'Europe/Rome';

/**
 * The provider emits UTC instants, but some fields (current.time, sunrise,
 * sunset) arrive without the trailing Z. Parsed bare they would be read as
 * local time and shown two hours early in summer.
 */
const BARE_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export const parseInstant = (value: string | number | Date): Date =>
  typeof value === 'string' && BARE_ISO.test(value) ? new Date(`${value}Z`) : new Date(value);

export const round1 = (value: number) => Math.round(value * 10) / 10;

export const toUnit = (celsius: number, unit: Unit) =>
  unit === 'f' ? (celsius * 9) / 5 + 32 : celsius;

/** Temperature with degree sign, converted to the active unit. */
export const formatTemp = (celsius: number | null | undefined, unit: Unit = 'c') =>
  typeof celsius === 'number' ? `${round1(toUnit(celsius, unit))}°` : '—';

export const formatTime = (value: string | number | Date) =>
  new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(
    parseInstant(value),
  );

export const formatDayLong = (value: string | number | Date) =>
  new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TZ,
  }).format(parseInstant(value));

export const formatDayShort = (isoDate: string) =>
  new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', timeZone: TZ }).format(
    new Date(`${isoDate}T12:00:00Z`),
  );

export const formatDayMonth = (isoDate: string) =>
  new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: TZ,
  }).format(new Date(`${isoDate}T12:00:00Z`));

export const compassLabel = (degrees: number) =>
  ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(degrees / 45) % 8];

export const conditionLabel = (code: number) => {
  if (code === 0) return 'Sereno';
  if ([1, 2, 3].includes(code)) return 'Poco nuvoloso';
  if ([45, 48].includes(code)) return 'Nebbia';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Pioviggine';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Pioggia';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve';
  if ([80, 81, 82].includes(code)) return 'Rovesci';
  if ([95, 96, 99].includes(code)) return 'Temporale';
  return 'Condizione corrente';
};

export type WeatherKind =
  'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'showers' | 'snow' | 'storm';

export const weatherKind = (code: number): WeatherKind => {
  if ([95, 96, 99].includes(code)) return 'storm';
  if ([80, 81, 82].includes(code)) return 'showers';
  if ([61, 63, 65, 66, 67].includes(code)) return 'rain';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([45, 48].includes(code)) return 'fog';
  if (code === 3) return 'cloudy';
  if ([1, 2].includes(code)) return 'partly';
  return 'clear';
};

export const isRainCode = (code: number) =>
  ['drizzle', 'rain', 'showers', 'storm', 'snow'].includes(weatherKind(code));

export const uvLabel = (value: number) =>
  value >= 8 ? 'molto alto' : value >= 6 ? 'alto' : value >= 3 ? 'moderato' : 'basso';

/** Beach comfort heuristic — surfaced as a score, never as a probability. */
export const beachScore = (waveHeight: number | null, sst: number | null) => {
  if (waveHeight === null && sst === null) return null;
  const waveTerm = waveHeight === null ? 60 : Math.max(0, 100 - waveHeight * 45);
  const sstTerm = sst === null ? 60 : Math.max(0, 100 - Math.abs(25 - sst) * 7);
  return Math.round(waveTerm * 0.55 + sstTerm * 0.45);
};
