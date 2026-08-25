import { describe, expect, it } from 'vitest';
import { ModelBattleApi } from './model-battle-api.js';

describe('Model Battle API', () => {
  it('returns explainable ranking metadata', async () => {
    const response = new ModelBattleApi().handle(
      new Request('https://lab.test/v1/locations/rimini/model-battle?metric=mae'),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).meta.metric).toBe('mae');
  });
});
