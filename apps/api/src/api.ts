import { locationSchema, type Location } from '@romagna-meteo/contracts';
import { findLocation, searchLocations } from '@romagna-meteo/domain';
import { ForecastStore, type StoredForecastPoint } from '@romagna-meteo/jobs';

type ApiMeta = {
  source: string;
  dataset: string;
  retrievedAt: string;
  freshness: 'fresh' | 'stale' | 'unknown';
  attribution: string;
};

type ApiResponse = {
  status: number;
  body: Record<string, unknown>;
  headers: Record<string, string>;
};

export class ForecastApi {
  private readonly cache = new Map<string, { expiresAt: number; response: ApiResponse }>();
  private readonly requests = new Map<string, { startedAt: number; count: number }>();

  constructor(
    private readonly store = new ForecastStore(),
    private readonly options: {
      now?: () => Date;
      rateLimit?: number;
      windowMs?: number;
      cacheMs?: number;
    } = {},
  ) {}

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const client = request.headers.get('x-client-id') ?? 'anonymous';
    if (!this.allow(client)) return json({ error: 'rate_limit_exceeded' }, 429);

    const path = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    const locationSlug = path[2];
    if (path[0] !== 'v1') return json({ error: 'not_found' }, 404);

    if (path[1] === 'locations' && path.length === 2) {
      return this.cached(`locations:${url.search}`, () => ({
        status: 200,
        body: { data: searchLocations(url.searchParams.get('q') ?? '') },
        headers: {},
      }));
    }

    const location = locationSlug ? findLocation(locationSlug) : undefined;
    if (!location) return json({ error: 'location_not_found' }, 404);
    if (path[3] === 'overview') return this.overview(location);
    if (path[3] === 'forecast') return this.forecast(location, url.searchParams);
    if (path[4] === 'compare') return this.compare(location, url.searchParams);
    return json({ error: 'not_found' }, 404);
  }

  private overview(location: Location): Response {
    const points = this.store.query({ locationId: location.id });
    const latest = points.at(-1);
    return json({
      data: { location, latest: latest ? pointData(latest) : null },
      meta: latest ? meta(latest) : { freshness: 'unknown' },
    });
  }

  private forecast(location: Location, params: URLSearchParams): Response {
    const key = `forecast:${location.slug}:${params.toString()}`;
    return this.cached(key, () => {
      const points = this.store.query({
        locationId: location.id,
        model: params.get('models') ?? undefined,
        variable: params.get('variables') ?? undefined,
        from: params.get('from') ?? undefined,
        to: params.get('to') ?? undefined,
      });
      return {
        status: 200,
        body: {
          data: points.map(pointData),
          meta: points[0] ? meta(points[0]) : { freshness: 'unknown' },
        },
        headers: {},
      };
    });
  }

  private compare(location: Location, params: URLSearchParams): Response {
    const points = this.store.query({
      locationId: location.id,
      variable: params.get('variable') ?? undefined,
    });
    const models = [...new Set(points.map((point) => point.model))];
    return json({
      data: models.map((model) => ({
        model,
        points: points.filter((point) => point.model === model).map(pointData),
      })),
      meta: points[0] ? meta(points[0]) : { freshness: 'unknown' },
    });
  }

  private cached(key: string, create: () => ApiResponse): Response {
    const now = (this.options.now?.() ?? new Date()).getTime();
    const hit = this.cache.get(key);
    if (hit && hit.expiresAt > now) return toResponse(hit.response);
    const response = create();
    this.cache.set(key, { response, expiresAt: now + (this.options.cacheMs ?? 30_000) });
    return toResponse(response);
  }

  private allow(client: string): boolean {
    const now = (this.options.now?.() ?? new Date()).getTime();
    const windowMs = this.options.windowMs ?? 60_000;
    const current = this.requests.get(client);
    if (!current || now - current.startedAt >= windowMs) {
      this.requests.set(client, { startedAt: now, count: 1 });
      return true;
    }
    if (current.count >= (this.options.rateLimit ?? 60)) return false;
    current.count += 1;
    return true;
  }
}

function pointData(point: StoredForecastPoint): Record<string, unknown> {
  return {
    validAt: point.validAt,
    leadHours: point.leadHours,
    variable: point.variable,
    value: point.value,
    unit: point.unit,
    model: point.model,
    runId: point.runId,
  };
}

function meta(point: StoredForecastPoint): ApiMeta {
  return {
    source: point.provenance.source,
    dataset: point.provenance.dataset,
    retrievedAt: point.retrievedAt,
    freshness: Date.now() - Date.parse(point.retrievedAt) < 3_600_000 ? 'fresh' : 'stale',
    attribution: point.provenance.attribution,
  };
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function toResponse(response: ApiResponse): Response {
  return json(response.body, response.status);
}

export { locationSchema };
