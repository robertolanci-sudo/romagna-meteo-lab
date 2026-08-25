export type ApiMetricsSnapshot = {
  freshnessSeconds: number[];
  providerFailures: number;
  requestDurationsMs: number[];
  cacheHits: number;
  cacheMisses: number;
  jobBacklog: number;
};

export class ApiMetrics {
  private readonly state: ApiMetricsSnapshot = {
    freshnessSeconds: [],
    providerFailures: 0,
    requestDurationsMs: [],
    cacheHits: 0,
    cacheMisses: 0,
    jobBacklog: 0,
  };
  recordFreshness(seconds: number): void {
    this.state.freshnessSeconds.push(Math.max(0, seconds));
  }
  recordProviderFailure(): void {
    this.state.providerFailures += 1;
  }
  recordRequest(durationMs: number): void {
    this.state.requestDurationsMs.push(Math.max(0, durationMs));
  }
  recordCache(hit: boolean): void {
    hit ? (this.state.cacheHits += 1) : (this.state.cacheMisses += 1);
  }
  setJobBacklog(size: number): void {
    this.state.jobBacklog = Math.max(0, size);
  }
  snapshot(): ApiMetricsSnapshot & { p95Ms: number | null } {
    const sorted = [...this.state.requestDurationsMs].sort((a, b) => a - b);
    return {
      ...this.state,
      p95Ms: sorted.length
        ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)]
        : null,
    };
  }
}
