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
    startPoint: { x: 420, y: 1815 },
    endPoint: { x: 1330, y: 1815 },
    width: 94,
    sidewalkWidth: 34,
    railingWidth: 22,
    bounds: { x: 380, y: 1537, width: 990, height: 557 },
    roadArea: { x: 380, y: 1768, width: 990, height: 104 },
    walkableAreas: [
      { x: 300, y: 1722, width: 1230, height: 194 },
      { x: 800, y: 1468, width: 166, height: 712 },
    ],
    collisionBoxes: [],
    waterAreas: [
      { x: 380, y: 1537, width: 440, height: 231 },
      { x: 946, y: 1537, width: 424, height: 231 },
      { x: 380, y: 1872, width: 440, height: 222 },
      { x: 946, y: 1872, width: 424, height: 222 },
    ],
  },
};

export const allBridgeConfigs = Object.values(bridgeConfigs);

export function getBridgeConfig(id: string) {
  return bridgeConfigs[id];
}
