type VercelRequest = { method?: string; url?: string };
type VercelResponse = {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
};

type GridPoint = {
  latitude: number;
  longitude: number;
  hourly?: {
    time?: string[];
    precipitation?: Array<number | null>;
    wind_speed_10m?: Array<number | null>;
    wind_direction_10m?: Array<number | null>;
  };
};

const grid = Array.from({ length: 6 }, (_, latitudeIndex) =>
  Array.from({ length: 8 }, (_, longitudeIndex) => ({
    latitude: Number((43.75 + latitudeIndex * 0.12).toFixed(2)),
    longitude: Number((11.95 + longitudeIndex * 0.16).toFixed(2)),
  })),
).flat();

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.status(405).send(JSON.stringify({ error: 'method_not_allowed' }));
    return;
  }
  const url = new URL(request.url ?? '/', 'https://romagna-meteo-lab.vercel.app');
  const hours = Math.min(Math.max(Number(url.searchParams.get('hours') ?? 24), 1), 24);
  const model = url.searchParams.get('models') ?? 'best_match';
  try {
    const upstreamUrl = new URL('https://api.open-meteo.com/v1/forecast');
    upstreamUrl.searchParams.set('latitude', grid.map((point) => point.latitude).join(','));
    upstreamUrl.searchParams.set('longitude', grid.map((point) => point.longitude).join(','));
    upstreamUrl.searchParams.set('hourly', 'precipitation,wind_speed_10m,wind_direction_10m');
    upstreamUrl.searchParams.set('forecast_hours', String(hours));
    upstreamUrl.searchParams.set('timezone', 'UTC');
    if (model !== 'best_match') upstreamUrl.searchParams.set('models', model);
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      response
        .status(502)
        .send(JSON.stringify({ error: 'provider_unavailable', providerStatus: upstream.status }));
      return;
    }
    const payload = (await upstream.json()) as GridPoint[];
    if (!Array.isArray(payload) || !payload[0]?.hourly?.time?.length) {
      response.status(502).send(JSON.stringify({ error: 'malformed_provider_payload' }));
      return;
    }
    response.status(200).setHeader('content-type', 'application/json; charset=utf-8');
    response.send(
      JSON.stringify({
        times: payload[0].hourly?.time ?? [],
        points: payload.map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          precipitation: point.hourly?.precipitation ?? [],
          windSpeed: point.hourly?.wind_speed_10m ?? [],
          windDirection: point.hourly?.wind_direction_10m ?? [],
        })),
        meta: {
          source: 'open-meteo',
          dataset: model,
          hours,
          region: 'Romagna grid',
          retrievedAt: new Date().toISOString(),
          attribution: 'Weather data by Open-Meteo.com',
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
