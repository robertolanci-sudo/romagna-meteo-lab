import { describe, expect, it } from 'vitest';
import { createMapRoomState, moveTime } from './map-room.js';

describe('Map Room state', () => {
  it('supports layer/time controls and reduced-motion state', () => {
    const state = createMapRoomState({
      validAt: '2026-08-25T00:00:00Z',
      reducedMotion: true,
      layer: 'wind',
    });
    expect(moveTime(state, 3)).toMatchObject({
      layer: 'wind',
      validAt: '2026-08-25T03:00:00.000Z',
      reducedMotion: true,
    });
  });
});
