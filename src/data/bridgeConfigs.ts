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
    startPoint: { x: 0, y: 1815 },
    endPoint: { x: 1370, y: 1815 },
    width: 94,
    sidewalkWidth: 34,
    railingWidth: 22,
    bounds: { x: 0, y: 1537, width: 1370, height: 557 },
    roadArea: { x: 0, y: 1768, width: 1370, height: 104 },
    walkableAreas: [
      { x: 0, y: 1722, width: 1530, height: 194 },
    ],
    collisionBoxes: [],
    waterAreas: [
      { x: 0, y: 1537, width: 560, height: 231 },
      { x: 760, y: 1537, width: 610, height: 231 },
      { x: 0, y: 1872, width: 560, height: 222 },
      { x: 760, y: 1872, width: 610, height: 222 },
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
