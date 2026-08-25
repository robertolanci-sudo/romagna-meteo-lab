import { MarineApi } from '@romagna-meteo/api';
import { OpenMeteoMarineAdapter } from '@romagna-meteo/providers';

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
    const api = new MarineApi(new OpenMeteoMarineAdapter());
    const result = await api.handle(new Request(url));
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
