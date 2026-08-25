import { z } from 'zod';

export * from './public-api.js';

export const isoUtc = z
  .string()
  .datetime({ offset: true })
  .refine((value) => value.endsWith('Z'), 'Timestamp must be expressed in UTC with a Z suffix');

export const latitude = z.number().min(-90).max(90);
export const longitude = z.number().min(-180).max(180);

export const provenanceSchema = z.object({
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  dataset: z.string().min(1),
  retrievedAt: isoUtc,
  validTime: isoUtc.optional(),
  providerRunAt: isoUtc.optional(),
  licenseRef: z.string().min(1),
  resolutionM: z.number().positive().optional(),
  quality: z.enum(['valid', 'partial', 'quarantined', 'unavailable']),
  attribution: z.string().min(1),
});

export const locationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  latitude,
  longitude,
  elevationM: z.number().finite().nullable(),
  timezone: z.string().min(1),
  region: z.string().min(1),
});

export const modelRunSchema = z.object({
  id: z.string().min(1),
  model: z.string().min(1),
  initializedAt: isoUtc,
  publishedAt: isoUtc,
  validFrom: isoUtc,
  validTo: isoUtc,
  sourceUri: z.string().url(),
  checksum: z.string().min(1),
  parserVersion: z.string().min(1),
});

export const weatherValueSchema = z.object({
  validAt: isoUtc,
  leadHours: z.number().int().nonnegative(),
  variable: z.string().min(1),
  value: z.number().finite().nullable(),
  unit: z.string().min(1),
  aggregation: z.enum(['instant', 'mean', 'min', 'max', 'sum']).optional(),
});

export const forecastSeriesSchema = z.object({
  location: locationSchema,
  run: modelRunSchema,
  values: z.array(weatherValueSchema),
  provenance: provenanceSchema,
});

export const observationSchema = z.object({
  locationId: z.string().min(1),
  observedAt: isoUtc,
  variable: z.string().min(1),
  value: z.number().finite().nullable(),
  unit: z.string().min(1),
  qualityFlag: z.enum(['pass', 'suspect', 'missing', 'quarantined']),
  provenance: provenanceSchema,
});

export const marineValueSchema = z.object({
  validAt: isoUtc,
  variable: z.enum([
    'sea_surface_temperature',
    'wave_height',
    'wave_direction',
    'wave_period',
    'wind_wave_height',
  ]),
  value: z.number().finite().nullable(),
  unit: z.string().min(1),
  gridMode: z.enum(['sea', 'nearest', 'land']),
});

export const marineSeriesSchema = z.object({
  location: locationSchema,
  values: z.array(marineValueSchema),
  coastalLimitation: z.string().min(1),
  provenance: provenanceSchema,
});

export type Location = z.infer<typeof locationSchema>;
export type ModelRun = z.infer<typeof modelRunSchema>;
export type WeatherValue = z.infer<typeof weatherValueSchema>;
export type ForecastSeries = z.infer<typeof forecastSeriesSchema>;
export type Observation = z.infer<typeof observationSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type MarineSeries = z.infer<typeof marineSeriesSchema>;
