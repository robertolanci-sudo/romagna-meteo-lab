import { locationSchema, type Location } from '@romagna-meteo/contracts';

const seededLocations: Location[] = [
  ['rimini', 'Rimini', 44.0594, 12.5683, 5],
  ['riccione', 'Riccione', 43.9996, 12.6561, 12],
  ['cattolica', 'Cattolica', 43.9618, 12.7363, 5],
  ['bellaria-igea-marina', 'Bellaria-Igea Marina', 44.1468, 12.4703, 2],
  ['cesenatico', 'Cesenatico', 44.2009, 12.3988, 2],
  ['ravenna', 'Ravenna', 44.4184, 12.2035, 4],
  ['cervia', 'Cervia', 44.2636, 12.3481, 2],
  ['cesena', 'Cesena', 44.1391, 12.2432, 44],
  ['forli', 'Forlì', 44.2227, 12.0407, 34],
  ['san-marino', 'San Marino', 43.9424, 12.4578, 749],
].map(([slug, name, latitude, longitude, elevationM], index) =>
  locationSchema.parse({
    id: `seed-${index + 1}`,
    slug,
    name,
    latitude,
    longitude,
    elevationM,
    timezone: 'Europe/Rome',
    region: 'Emilia-Romagna',
  }),
);

export const romagnaLocations: readonly Location[] = seededLocations;

export function findLocation(slug: string): Location | undefined {
  return romagnaLocations.find((location) => location.slug === slug);
}

export function searchLocations(query: string): Location[] {
  const normalized = query.trim().toLocaleLowerCase('it-IT');
  if (!normalized) return [...romagnaLocations];
  return romagnaLocations.filter((location) =>
    `${location.name} ${location.slug}`.toLocaleLowerCase('it-IT').includes(normalized),
  );
}
