import { ForecastApi } from '@romagna-meteo/api';
import { findLocation } from '@romagna-meteo/domain';
import { ForecastStore } from '@romagna-meteo/jobs';
import { OpenMeteoForecastAdapter } from '@romagna-meteo/providers';

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
  const slug = url.pathname.split('/').filter(Boolean).at(-2);
  const location = slug ? findLocation(slug) : undefined;
  if (!location) {
    response.status(404).send(JSON.stringify({ error: 'location_not_found' }));
    return;
  }
  try {
    const adapter = new OpenMeteoForecastAdapter();
    const model = url.searchParams.get('models') ?? 'ecmwf_ifs04';
    const store = new ForecastStore();
    store.upsert(await adapter.fetch(location, model));
    const api = new ForecastApi(store);
    const webRequest = new Request(url, { headers: { 'x-client-id': 'vercel-public' } });
    const result = await api.handle(webRequest);
    response.status(result.status).setHeader('content-type', 'application/json; charset=utf-8');
    response.send(await result.text());
  } catch (error) {
    response.status(502).send(
      JSON.stringify({
        error: 'provider_unavailable',
        detail: error instanceof Error ? error.message : 'unknown',
      }),
    );
  }
}
