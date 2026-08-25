import { apiErrorSchema } from '@romagna-meteo/contracts';
import { ForecastApi } from './api.js';

export class PublicApi {
  constructor(
    private readonly forecast = new ForecastApi(),
    private readonly allowedOrigins: readonly string[] = [],
  ) {}

  async handle(request: Request): Promise<Response> {
    const origin = request.headers.get('origin');
    if (origin && this.allowedOrigins.length && !this.allowedOrigins.includes(origin))
      return this.error('origin_not_allowed', 403);
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return this.error('method_not_allowed', 405);
    const response = await this.forecast.handle(request);
    const headers = new Headers(response.headers);
    headers.set('x-api-version', 'v1');
    headers.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
    headers.set('access-control-allow-headers', 'content-type, x-client-id');
    if (origin && this.allowedOrigins.includes(origin))
      headers.set('access-control-allow-origin', origin);
    return new Response(response.body, { status: response.status, headers });
  }

  private error(error: string, status: number): Response {
    const body = apiErrorSchema.parse({ error });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'x-api-version': 'v1' },
    });
  }
}
