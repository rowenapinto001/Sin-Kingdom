import { Direction } from '../game/types';

export type WorldLocationId =
  | 'playerHouse'
  | 'boatingDock'
  | 'magicCity'
  | 'partyPartyYeah'
  | 'policeStation'
  | 'raniRajMahal'
  | 'friendsHouse'
  | 'pinkPalace'
  | 'airport'
  | 'clockTower'
  | 'desert'
  | 'garage'
  | 'roseTemple'
  | 'garden'
  | 'doorway';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WorldLocation = Rect & {
  id: WorldLocationId;
  name: string;
  theme: string;
  color: string;
  accent: string;
  enterable: boolean;
  restricted?: boolean;
  interaction: string;
  interiorTitle: string;
  interiorDescription: string;
};

export type WorldNpc = {
  id: string;
  name: string;
  characterId: string;
  role: 'civilian' | 'guard' | 'police' | 'friend' | 'dancer';
  x: number;
  y: number;
  patrol: Array<{ x: number; y: number }>;
  speed: number;
  direction: Direction;
};

export type WorldObject = Rect & {
  id: string;
  label: string;
  kind: 'road' | 'bridge' | 'footpath' | 'grass' | 'water' | 'building' | 'decor' | 'vehicle' | 'stage' | 'sand';
  color: string;
  blocked?: boolean;
  rotate?: string;
};
