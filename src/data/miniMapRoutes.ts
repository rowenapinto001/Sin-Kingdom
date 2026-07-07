import { WorldLocationId } from '../world/worldTypes';

export type MiniMapPoint = {
  x: number;
  y: number;
};

export type MiniMapRoute = {
  id: string;
  points: MiniMapPoint[];
  kind?: 'road' | 'bridge';
};

export type MiniMapTrafficLight = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
};

export const miniMapWaterZone = {
  x: 72,
  y: 248,
  width: 210,
  height: 96,
};

export const miniMapBridge = {
  x: 86,
  y: 286,
  width: 344,
  height: 28,
};

export const miniMapRoutes: MiniMapRoute[] = [
  { id: 'top-2-3-4', points: [{ x: 112, y: 102 }, { x: 420, y: 96 }, { x: 722, y: 98 }] },
  { id: 'left-2-bridge-1-9', points: [{ x: 112, y: 102 }, { x: 94, y: 194 }, { x: 110, y: 300 }, { x: 112, y: 420 }, { x: 128, y: 790 }] },
  { id: 'bridge-to-12', kind: 'bridge', points: [{ x: 110, y: 300 }, { x: 430, y: 300 }] },
  { id: 'middle-3-12-10-13', points: [{ x: 420, y: 96 }, { x: 430, y: 300 }, { x: 430, y: 640 }, { x: 430, y: 790 }] },
  { id: 'bottom-left-9-13-14', points: [{ x: 128, y: 790 }, { x: 430, y: 790 }, { x: 650, y: 790 }] },
  { id: 'center-right-4-7-11-14', points: [{ x: 722, y: 98 }, { x: 610, y: 300 }, { x: 650, y: 640 }, { x: 650, y: 790 }] },
  { id: 'right-4-6-8-15', points: [{ x: 722, y: 98 }, { x: 820, y: 360 }, { x: 858, y: 650 }, { x: 858, y: 790 }] },
  { id: 'bottom-14-15', points: [{ x: 650, y: 790 }, { x: 858, y: 790 }] },
  { id: 'bottom-15-11', points: [{ x: 858, y: 790 }, { x: 650, y: 640 }] },
  { id: 'police-spur-4-5', points: [{ x: 722, y: 98 }, { x: 900, y: 126 }] },
];

export const miniMapTrafficLights: MiniMapTrafficLight[] = [
  { id: 'bridge-to-player-light', x: 112, y: 365, rotation: 90 },
  { id: 'garage-clock-light', x: 430, y: 472 },
  { id: 'right-top-light', x: 790, y: 170 },
  { id: 'right-bottom-light', x: 650, y: 712 },
];

export const miniMapLocationOrder: WorldLocationId[] = [
  'playerHouse',
  'boatingDock',
  'magicCity',
  'partyPartyYeah',
  'policeStation',
  'raniRajMahal',
  'friendsHouse',
  'pinkPalace',
  'airport',
  'clockTower',
  'desert',
  'garage',
  'roseTemple',
  'garden',
  'doorway',
];
