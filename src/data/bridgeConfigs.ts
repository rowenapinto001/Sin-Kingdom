import { Rect } from '../world/worldTypes';

export type BridgeConfig = {
  id: string;
  name: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  width: number;
  sidewalkWidth: number;
  railingWidth: number;
  bounds: Rect;
  roadArea: Rect;
  walkableAreas: Rect[];
  collisionBoxes: Rect[];
  waterAreas: Rect[];
};

export const bridgeConfigs: Record<string, BridgeConfig> = {
  'bridge-friends-canal': {
    id: 'bridge-friends-canal',
    name: 'Friends Canal Bridge',
    startPoint: { x: 750, y: 3300 },
    endPoint: { x: 1650, y: 3300 },
    width: 94,
    sidewalkWidth: 34,
    railingWidth: 22,
    bounds: { x: 750, y: 3022, width: 900, height: 557 },
    roadArea: { x: 750, y: 3253, width: 900, height: 104 },
    walkableAreas: [
      { x: 750, y: 3207, width: 900, height: 194 },
    ],
    collisionBoxes: [],
    waterAreas: [
      { x: 750, y: 3022, width: 360, height: 231 },
      { x: 1290, y: 3022, width: 360, height: 231 },
      { x: 750, y: 3357, width: 360, height: 222 },
      { x: 1290, y: 3357, width: 360, height: 222 },
    ],
  },
};

export const allBridgeConfigs = Object.values(bridgeConfigs);

export const miniMapBridgeConfig = {
  waterZone: { x: 72, y: 248, width: 210, height: 96 },
  bridgeRoad: { x: 86, y: 286, width: 344, height: 28 },
  label: 'Bridge',
};

export function getBridgeConfig(id: string) {
  return bridgeConfigs[id];
}
