import { fetchMarine } from '../../../_lib/weather.js';

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
    const result = await fetchMarine(slug, gridMode);
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
