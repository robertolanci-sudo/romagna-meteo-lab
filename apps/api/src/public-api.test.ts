import { describe, expect, it } from 'vitest';
import { PublicApi } from './public-api.js';

describe('public API hardening', () => {
  it('rejects unapproved origins and exposes version headers', async () => {
    const api = new PublicApi(undefined, ['https://dashboard.example']);
    const blocked = await api.handle(
      new Request('https://lab.test/v1/locations?q=rimini', {
        headers: { origin: 'https://evil.example' },
      }),
    );
    expect(blocked.status).toBe(403);
    const allowed = await api.handle(
      new Request('https://lab.test/v1/locations?q=rimini', {
        headers: { origin: 'https://dashboard.example' },
      }),
    );
    expect(allowed.headers.get('x-api-version')).toBe('v1');
    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://dashboard.example');
  });
});
