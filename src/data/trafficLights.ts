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
  { id: 'boating-crossing-light', x: 1610, y: 1090, rotation: 0, scale: 0.58, side: 'west', collision: true },
  { id: 'magic-city-crossing-west', x: 3960, y: 1090, rotation: 0, scale: 0.58, side: 'west', collision: true },
  { id: 'magic-city-crossing-east', x: 4040, y: 1210, rotation: 0, scale: 0.58, side: 'east', collision: true },
  { id: 'party-road-light', x: 6460, y: 1090, rotation: 0, scale: 0.58, side: 'north', collision: true },
  { id: 'police-road-light', x: 9060, y: 1210, rotation: 0, scale: 0.62, side: 'south', collision: true },
  { id: 'bridge-entry-light-west', x: 780, y: 3230, rotation: 0, scale: 0.62, side: 'west', collision: true },
  { id: 'bridge-exit-light-east', x: 1620, y: 3370, rotation: 0, scale: 0.62, side: 'east', collision: true },
  { id: 'mahal-road-light', x: 1910, y: 3240, rotation: 0, scale: 0.58, side: 'north', collision: true },
  { id: 'player-house-gate-light-left', x: 5990, y: 3440, rotation: 0, scale: 0.58, side: 'west', collision: true },
  { id: 'player-house-gate-light-right', x: 6110, y: 3560, rotation: 0, scale: 0.58, side: 'east', collision: true },
  { id: 'friends-house-road-light', x: 8360, y: 3340, rotation: 0, scale: 0.6, side: 'north', collision: true },
  { id: 'pink-palace-road-light', x: 10660, y: 3240, rotation: 0, scale: 0.62, side: 'north', collision: true },
  { id: 'clock-tower-road-light', x: 7560, y: 5640, rotation: 0, scale: 0.62, side: 'north', collision: true },
  { id: 'desert-road-light', x: 10510, y: 5640, rotation: 0, scale: 0.64, side: 'west', collision: true },
  { id: 'rose-temple-road-light', x: 3960, y: 6740, rotation: 0, scale: 0.6, side: 'west', collision: true },
  { id: 'airport-road-light', x: 1610, y: 5640, rotation: 0, scale: 0.66, side: 'east', collision: true },
  { id: 'garden-district-light', x: 6410, y: 6740, rotation: 0, scale: 0.62, side: 'west', collision: true },
  { id: 'doorway-road-light', x: 8960, y: 6740, rotation: 0, scale: 0.62, side: 'west', collision: true },
  { id: 'garage-road-light', x: 1560, y: 6740, rotation: 0, scale: 0.56, side: 'east', collision: true },
];

export const trafficLightCollisionBoxes: Rect[] = trafficLights
  .filter((light) => light.collision)
  .map((light) => ({
    x: light.x + 10,
    y: light.y + 72,
    width: 24,
    height: 24,
  }));
