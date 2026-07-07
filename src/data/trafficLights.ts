import { Rect } from '../world/worldTypes';

export type TrafficLightSide = 'north' | 'south' | 'east' | 'west';

export type TrafficLightPlacement = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  side: TrafficLightSide;
  collision: boolean;
};

export const trafficLights: TrafficLightPlacement[] = [
  { id: 'magic-city-crossing-west', x: 1628, y: 492, rotation: 0, scale: 0.58, side: 'west', collision: true },
  { id: 'magic-city-crossing-east', x: 1782, y: 596, rotation: 180, scale: 0.58, side: 'east', collision: true },
  { id: 'garage-north-crossing', x: 2260, y: 492, rotation: 0, scale: 0.56, side: 'north', collision: true },
  { id: 'central-crossroad-north', x: 2432, y: 492, rotation: 0, scale: 0.64, side: 'north', collision: true },
  { id: 'central-crossroad-south', x: 2528, y: 622, rotation: 180, scale: 0.64, side: 'south', collision: true },
  { id: 'party-road-light', x: 3595, y: 488, rotation: 0, scale: 0.58, side: 'north', collision: true },
  { id: 'police-road-light', x: 4806, y: 622, rotation: 180, scale: 0.62, side: 'south', collision: true },
  { id: 'bridge-entry-light-west', x: 1240, y: 1745, rotation: 90, scale: 0.62, side: 'west', collision: true },
  { id: 'bridge-exit-light-east', x: 1486, y: 1870, rotation: -90, scale: 0.62, side: 'east', collision: true },
  { id: 'friends-city-connector-light', x: 1970, y: 1808, rotation: 90, scale: 0.58, side: 'north', collision: true },
  { id: 'player-house-gate-light-left', x: 2320, y: 3212, rotation: 0, scale: 0.58, side: 'west', collision: true },
  { id: 'player-house-gate-light-right', x: 2508, y: 3338, rotation: 180, scale: 0.58, side: 'east', collision: true },
  { id: 'pink-palace-road-light', x: 4248, y: 3582, rotation: 0, scale: 0.62, side: 'north', collision: true },
  { id: 'clock-tower-road-light', x: 2470, y: 4640, rotation: 0, scale: 0.62, side: 'north', collision: true },
  { id: 'desert-road-light', x: 4235, y: 5430, rotation: 0, scale: 0.64, side: 'west', collision: true },
  { id: 'rose-temple-road-light', x: 3085, y: 6042, rotation: 0, scale: 0.6, side: 'west', collision: true },
  { id: 'airport-road-light', x: 618, y: 7030, rotation: 0, scale: 0.66, side: 'east', collision: true },
  { id: 'garden-district-light', x: 3985, y: 7135, rotation: 90, scale: 0.62, side: 'west', collision: true },
  { id: 'doorway-road-light', x: 4612, y: 8004, rotation: 0, scale: 0.62, side: 'west', collision: true },
  { id: 'far-sea-dock-light', x: 635, y: 7778, rotation: 180, scale: 0.56, side: 'east', collision: true },
];

export const trafficLightCollisionBoxes: Rect[] = trafficLights
  .filter((light) => light.collision)
  .map((light) => ({
    x: light.x + 10,
    y: light.y + 72,
    width: 24,
    height: 24,
  }));
