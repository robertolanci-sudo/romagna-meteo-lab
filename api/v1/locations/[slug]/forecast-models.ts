type VercelRequest = { method?: string; url?: string };
type VercelResponse = {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
};

type Upstream = {
  hourly?: Record<string, unknown[]>;
  daily?: Record<string, unknown[]>;
  model?: string;
  latitude?: number;
  longitude?: number;
};

const locations: Record<string, [number, number]> = {
  rimini: [44.0594, 12.5683],
  riccione: [43.9996, 12.6561],
  cattolica: [43.9618, 12.7363],
};

const models = [
  { key: 'ecmwf_ifs025', label: 'ECMWF IFS', resolution: '25 km' },
  { key: 'icon_seamless', label: 'DWD ICON', resolution: '2–11 km' },
  { key: 'meteofrance_seamless', label: 'Météo-France', resolution: '1–25 km' },
];

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.status(405).send(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }
  const url = new URL(request.url ?? '/', 'https://romagna-meteo-lab.vercel.app');
  const slug = url.pathname.split('/').filter(Boolean).at(-2) ?? '';
  const point = locations[slug];
  if (!point) {
    response.status(404).send(JSON.stringify({ error: 'location_not_found' }));
    return;
  }
  try {
    const results = await Promise.all(
      models.map(async (model) => {
        const providerUrl = new URL('https://api.open-meteo.com/v1/forecast');
        providerUrl.searchParams.set('latitude', String(point[0]));
        providerUrl.searchParams.set('longitude', String(point[1]));
        providerUrl.searchParams.set('models', model.key);
        providerUrl.searchParams.set(
          'hourly',
          'temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code',
        );
        providerUrl.searchParams.set(
          'daily',
          'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,weather_code',
        );
        providerUrl.searchParams.set('forecast_days', '14');
        providerUrl.searchParams.set('timezone', 'UTC');
        const upstream = await fetch(providerUrl);
        if (!upstream.ok)
          return {
            ...model,
            hourly: undefined,
            daily: undefined,
            error: `provider_${upstream.status}`,
          };
        const payload = (await upstream.json()) as Upstream;
        return { ...model, hourly: payload.hourly ?? {}, daily: payload.daily ?? {}, error: null };
      }),
    );
    const valid = results.filter((result) => !result.error && Array.isArray(result.hourly?.time));
    if (!valid.length) {
      response.status(502).send(JSON.stringify({ error: 'provider_unavailable' }));
      return;
    }
    const times = valid[0].hourly?.time ?? [];
    response.status(200).setHeader('content-type', 'application/json; charset=utf-8');
    response.send(
      JSON.stringify({
        times,
        models: valid,
        meta: {
          source: 'open-meteo',
          location: slug,
          retrievedAt: new Date().toISOString(),
          attribution: 'Forecast data by Open-Meteo.com',
        },
      }),
    );
  } catch (error) {
    response.status(502).send(
      JSON.stringify({
        error: 'provider_unavailable',
        detail: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}
