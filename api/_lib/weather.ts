const locations: Record<string, { id: string; name: string; latitude: number; longitude: number }> =
  {
    rimini: { id: 'seed-1', name: 'Rimini', latitude: 44.0594, longitude: 12.5683 },
    riccione: { id: 'seed-2', name: 'Riccione', latitude: 43.9996, longitude: 12.6561 },
    cattolica: { id: 'seed-3', name: 'Cattolica', latitude: 43.9618, longitude: 12.7363 },
  };

export function getLocation(slug: string) {
  return locations[slug];
}

export async function fetchForecast(slug: string, model: string) {
  const location = getLocation(slug);
  if (!location) return { status: 404, body: { error: 'location_not_found' } };
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('hourly', 'temperature_2m,precipitation,wind_speed_10m');
  url.searchParams.set('models', model);
  url.searchParams.set('timezone', 'UTC');
  const response = await fetch(url);
  if (!response.ok)
    return {
      status: 502,
      body: { error: 'provider_unavailable', providerStatus: response.status },
    };
  const payload = (await response.json()) as { hourly?: Record<string, unknown[]> };
  const hourly = payload.hourly;
  const times = Array.isArray(hourly?.time) ? (hourly.time as string[]) : [];
  if (!times.length) return { status: 502, body: { error: 'malformed_provider_payload' } };
  const variables = [
    ['temperature_2m', '°C'],
    ['precipitation', 'mm'],
    ['wind_speed_10m', 'km/h'],
  ] as const;
  const data = variables.flatMap(([variable, unit]) =>
    (Array.isArray(hourly?.[variable]) ? hourly[variable] : []).map((value, index) => ({
      validAt: `${times[index]}:00Z`,
      leadHours: index,
      variable,
      value: typeof value === 'number' ? value : null,
      unit,
      model,
    })),
  );
  return {
    status: 200,
    body: {
      data,
      meta: {
        source: 'open-meteo',
        dataset: model,
        retrievedAt: new Date().toISOString(),
        attribution: 'Weather data by Open-Meteo.com',
      },
    },
  };
}

export async function fetchMarine(slug: string, gridMode: string) {
  const location = getLocation(slug);
  if (!location) return { status: 404, body: { error: 'location_not_found' } };
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set(
    'hourly',
    'sea_surface_temperature,wave_height,wave_direction,wave_period,wind_wave_height',
  );
  url.searchParams.set('timezone', 'UTC');
  const response = await fetch(url);
  if (!response.ok)
    return {
      status: 502,
      body: { error: 'provider_unavailable', providerStatus: response.status },
    };
  const payload = (await response.json()) as { hourly?: Record<string, unknown[]> };
  const hourly = payload.hourly;
  const times = Array.isArray(hourly?.time) ? (hourly.time as string[]) : [];
  if (!times.length) return { status: 502, body: { error: 'malformed_provider_payload' } };
  const variables = [
    ['sea_surface_temperature', '°C'],
    ['wave_height', 'm'],
    ['wave_direction', '°'],
    ['wave_period', 's'],
    ['wind_wave_height', 'm'],
  ] as const;
  const data = variables.flatMap(([variable, unit]) =>
    (Array.isArray(hourly?.[variable]) ? hourly[variable] : []).map((value, index) => ({
      validAt: `${times[index]}:00Z`,
      variable,
      value: typeof value === 'number' ? value : null,
      unit,
      gridMode,
    })),
  );
  return {
    status: 200,
    body: {
      data,
      meta: {
        source: 'open-meteo-marine',
        dataset: 'open-meteo-marine',
        retrievedAt: new Date().toISOString(),
        attribution: 'Marine data by Open-Meteo.com',
        coastalLimitation: 'Marine model grid is offshore; near-shore values are indicative.',
      },
    },
  };
}
