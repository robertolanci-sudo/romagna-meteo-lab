import { fetchForecast } from '../../../_lib/weather.js';

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
    const result = await fetchForecast(slug, model);
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
