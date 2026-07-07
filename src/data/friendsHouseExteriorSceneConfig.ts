import { Rect } from '../world/worldTypes';

export const friendsHouseExteriorScene = {
  width: 1600,
  height: 900,
  playerSpawn: { x: 760, y: 800 },
  bossSpawn: { x: 700, y: 805 },
  arionSpawn: { x: 650, y: 710 },
};

export const friendsHouseExteriorWalkZones: Rect[] = [
  { x: 0, y: 790, width: 1600, height: 110 },
  { x: 650, y: 590, width: 300, height: 250 },
  { x: 1050, y: 570, width: 360, height: 300 },
  { x: 260, y: 610, width: 340, height: 230 },
  { x: 470, y: 650, width: 650, height: 190 },
];

export const friendsHouseExteriorBlockedZones: Rect[] = [
  { x: 180, y: 80, width: 1240, height: 470 },
  { x: 100, y: 0, width: 1400, height: 350 },
  { x: 0, y: 520, width: 420, height: 180 },
  { x: 0, y: 650, width: 650, height: 60 },
  { x: 950, y: 650, width: 650, height: 60 },
  { x: 1120, y: 520, width: 320, height: 230 },
  { x: 0, y: 0, width: 80, height: 900 },
  { x: 1520, y: 0, width: 80, height: 900 },
];

export const friendsHouseExteriorInteractZones = [
  {
    id: 'enterHouse',
    label: 'ENTER HOUSE',
    x: 700,
    y: 560,
    width: 220,
    height: 120,
  },
  {
    id: 'talkArion',
    label: 'ENTER HOUSE',
    x: 600,
    y: 690,
    width: 180,
    height: 140,
  },
  {
    id: 'talkBoss',
    label: 'Talk to Boss',
    x: 900,
    y: 690,
    width: 180,
    height: 140,
  },
] as const;

export type FriendsHouseExteriorInteractId = typeof friendsHouseExteriorInteractZones[number]['id'];
