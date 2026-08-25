type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};
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
  const slug = url.pathname.split('/').filter(Boolean).at(-2) ?? '';
  try {
    const model = url.searchParams.get('models') ?? 'ecmwf_ifs04';
    const result = await fetchLiveForecast(slug, model);
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

async function fetchLiveForecast(slug: string, model: string) {
  const coordinates: Record<string, [number, number]> = {
    rimini: [44.0594, 12.5683],
    riccione: [43.9996, 12.6561],
    cattolica: [43.9618, 12.7363],
  };
  const point = coordinates[slug];
  if (!point) return { status: 404, body: { error: 'location_not_found' } };
  const buildUrl = (requestedModel?: string) => {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(point[0]));
    url.searchParams.set('longitude', String(point[1]));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index,weather_code',
    );
    url.searchParams.set('hourly', 'temperature_2m,precipitation,wind_speed_10m');
    url.searchParams.set('daily', 'sunrise,sunset');
    if (requestedModel) url.searchParams.set('models', requestedModel);
    url.searchParams.set('timezone', 'UTC');
    return url;
  };
  let selectedModel = model;
  let upstream = await fetch(buildUrl(model));
  if (!upstream.ok)
    return {
      status: 502,
      body: { error: 'provider_unavailable', providerStatus: upstream.status },
    };
  let payload = (await upstream.json()) as {
    current?: Record<string, unknown>;
    current_units?: Record<string, string>;
    daily?: Record<string, unknown[]>;
    timezone?: string;
    hourly?: Record<string, unknown[]>;
    model?: string;
  };
  const hasNumericValue = Object.entries(payload.hourly ?? {})
    .filter(([key]) => key !== 'time')
    .some(
      ([, values]) => Array.isArray(values) && values.some((value) => typeof value === 'number'),
    );
  if (!hasNumericValue && model !== 'best_match') {
    const fallback = await fetch(buildUrl());
    if (fallback.ok) {
      payload = (await fallback.json()) as typeof payload;
      selectedModel = payload.model ?? 'best_match';
    }
  }
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
      model: selectedModel,
    })),
  );
  return {
    status: 200,
    body: {
      data,
      current: payload.current ?? null,
      currentUnits: payload.current_units ?? null,
      daily: payload.daily ?? null,
      timezone: payload.timezone ?? 'UTC',
      meta: {
        source: 'open-meteo',
        dataset: selectedModel,
        retrievedAt: new Date().toISOString(),
        attribution: 'Weather data by Open-Meteo.com',
      },
    },
  };
}
