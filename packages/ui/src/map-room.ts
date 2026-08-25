export const mapLayers = ['precipitation', 'temperature', 'wind', 'sst'] as const;
export type MapLayer = (typeof mapLayers)[number];
export type MapRoomState = {
  layer: MapLayer;
  validAt: string;
  loading: boolean;
  error?: string;
  reducedMotion: boolean;
  attribution: string;
};

export function createMapRoomState(overrides: Partial<MapRoomState> = {}): MapRoomState {
  return {
    layer: 'precipitation',
    validAt: new Date().toISOString(),
    loading: false,
    reducedMotion: false,
    attribution: 'Map data and weather layers: source attribution required.',
    ...overrides,
  };
}

export function moveTime(state: MapRoomState, hours: number): MapRoomState {
  return {
    ...state,
    validAt: new Date(Date.parse(state.validAt) + hours * 3_600_000).toISOString(),
  };
}
