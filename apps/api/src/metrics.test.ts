import { describe, expect, it } from 'vitest';
import { ApiMetrics } from './metrics.js';

describe('API metrics', () => {
  it('tracks freshness, provider failures, cache and p95', () => {
    const metrics = new ApiMetrics();
    [20, 40, 60, 80, 100].forEach((value) => metrics.recordRequest(value));
    metrics.recordFreshness(30);
    metrics.recordProviderFailure();
    metrics.recordCache(true);
    metrics.recordCache(false);
    metrics.setJobBacklog(2);
    expect(metrics.snapshot()).toMatchObject({
      p95Ms: 100,
      providerFailures: 1,
      cacheHits: 1,
      cacheMisses: 1,
      jobBacklog: 2,
    });
  });
});
