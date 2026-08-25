type VercelRequest = { method?: string; url?: string };
type VercelResponse = {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'GET') {
    response.status(405).send(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }
  const url = new URL(request.url ?? '/', 'https://romagna-meteo-lab.vercel.app');
  try {
    const gridMode = url.searchParams.get('grid') ?? 'sea';
    if (!['sea', 'nearest', 'land'].includes(gridMode)) {
      response.status(400).send(JSON.stringify({ error: 'invalid_grid_mode' }));
      return;
    }
    const slug = url.pathname.split('/').filter(Boolean).at(-2) ?? '';
    const result = await fetchLiveMarine(slug, gridMode);
    response.status(result.status).setHeader('content-type', 'application/json; charset=utf-8');
    response.send(JSON.stringify(result.body));
  } catch (error) {
    response.status(502).send(
      JSON.stringify({
        error: 'provider_unavailable',
        detail: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}

async function fetchLiveMarine(slug: string, gridMode: string) {
  const coordinates: Record<string, [number, number]> = {
    rimini: [44.0594, 12.5683],
    riccione: [43.9996, 12.6561],
    cattolica: [43.9618, 12.7363],
  };
  const point = coordinates[slug];
  if (!point) return { status: 404, body: { error: 'location_not_found' } };
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');
  url.searchParams.set('latitude', String(point[0]));
  url.searchParams.set('longitude', String(point[1]));
  url.searchParams.set(
    'hourly',
    'sea_surface_temperature,wave_height,wave_direction,wave_period,wind_wave_height',
  );
  url.searchParams.set('timezone', 'UTC');
  const upstream = await fetch(url);
  if (!upstream.ok)
    return {
      status: 502,
      body: { error: 'provider_unavailable', providerStatus: upstream.status },
    };
  const payload = (await upstream.json()) as { hourly?: Record<string, unknown[]> };
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
