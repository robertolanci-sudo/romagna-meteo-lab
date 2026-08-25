import { z } from 'zod';

export const widgetConfigSchema = z.object({
  version: z.literal(1),
  location: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  theme: z
    .object({
      logo: z.string().max(500).optional(),
      palette: z
        .object({
          accent: z
            .string()
            .regex(/^#[0-9a-f]{6}$/i)
            .default('#4ed6e9'),
          surface: z
            .string()
            .regex(/^#[0-9a-f]{6}$/i)
            .default('#12152b'),
        })
        .default({}),
      density: z.enum(['compact', 'comfortable']).default('comfortable'),
      locale: z.enum(['it', 'en']).default('it'),
      reducedMotion: z.boolean().default(false),
    })
    .default({}),
  fields: z
    .array(z.enum(['temperature', 'wind', 'rain', 'marine', 'updatedAt']))
    .min(1)
    .max(10)
    .default(['temperature', 'updatedAt']),
  endpoint: z.string().url().optional(),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

export function parseWidgetConfig(input: unknown): WidgetConfig {
  return widgetConfigSchema.parse(input);
}

export function renderStaleState(updatedAt?: string): string {
  return updatedAt
    ? `Dati non aggiornati dal ${updatedAt}.`
    : 'Dati temporaneamente non disponibili.';
}
