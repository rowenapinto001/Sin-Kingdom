import { Rect } from '../world/worldTypes';
import { friendsHouseExterior } from './friendsHouseExteriorConfig';

export type FriendsHouseRoom = Rect & {
  id: string;
  name: string;
  floor: string;
};

export type FriendsHouseInteractZone = Rect & {
  id: 'arion' | 'boss' | 'laptop' | 'exit';
  label: string;
};

export { friendsHouseExterior };

export const friendsHouseInterior = {
  width: 1600,
  height: 1000,
  wallThickness: 28,
  hallwayWidth: 150,
  doorWidth: 90,
  playerSpawn: { x: 780, y: 872 },
  bossMeetingSpot: { x: 930, y: 565 },
  arionSpot: { x: 690, y: 590 },
};

export const friendsHouseRooms: FriendsHouseRoom[] = [
  { id: 'bedroom', name: 'Bedroom', x: 80, y: 80, width: 360, height: 260, floor: '#33233d' },
  { id: 'gameRoom', name: 'Game Room', x: 520, y: 80, width: 420, height: 260, floor: '#253348' },
  { id: 'studyRoom', name: 'Study Room', x: 1030, y: 80, width: 420, height: 260, floor: '#302b24' },
  { id: 'centralHallway', name: 'Central Hallway', x: 440, y: 360, width: 680, height: 120, floor: '#2b2732' },
  { id: 'hall', name: 'Stair Hall', x: 80, y: 430, width: 360, height: 300, floor: '#2e2c38' },
  { id: 'livingRoom', name: 'Living Room', x: 520, y: 420, width: 560, height: 340, floor: '#3a2635' },
  { id: 'kitchen', name: 'Kitchen', x: 1120, y: 430, width: 360, height: 300, floor: '#263842' },
  { id: 'bathroom', name: 'Bathroom', x: 1120, y: 760, width: 300, height: 180, floor: '#26364a' },
  { id: 'entrance', name: 'Main Entrance', x: 650, y: 850, width: 300, height: 100, floor: '#3c342c' },
];

export const friendsHouseCollisionBoxes: Rect[] = [
  { x: 0, y: 0, width: 1600, height: 52 },
  { x: 0, y: 0, width: 52, height: 1000 },
  { x: 1548, y: 0, width: 52, height: 1000 },
  { x: 0, y: 972, width: 650, height: 28 },
  { x: 950, y: 972, width: 650, height: 28 },
  { x: 440, y: 80, width: 80, height: 260 },
  { x: 940, y: 80, width: 90, height: 260 },
  { x: 440, y: 480, width: 80, height: 250 },
  { x: 1080, y: 420, width: 40, height: 340 },
  { x: 1120, y: 730, width: 360, height: 30 },
  { x: 150, y: 135, width: 210, height: 92 },
  { x: 625, y: 155, width: 230, height: 92 },
  { x: 1110, y: 138, width: 260, height: 85 },
  { x: 590, y: 585, width: 210, height: 62 },
  { x: 1160, y: 502, width: 250, height: 76 },
  { x: 1185, y: 806, width: 170, height: 80 },
];

export const friendsHouseInteractZones: FriendsHouseInteractZone[] = [
  { id: 'arion', label: 'ENTER HOUSE', x: 635, y: 530, width: 150, height: 135 },
  { id: 'boss', label: 'Boss Meeting', x: 860, y: 500, width: 170, height: 150 },
  { id: 'laptop', label: 'Study Laptop', x: 1110, y: 120, width: 210, height: 145 },
  { id: 'exit', label: 'Exit House', x: 650, y: 862, width: 300, height: 96 },
];
