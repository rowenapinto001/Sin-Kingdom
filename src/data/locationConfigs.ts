import { ImageSourcePropType } from 'react-native';
import { Rect, WorldLocationId } from '../world/worldTypes';

export type LocationInteractionType =
  | 'home'
  | 'boat'
  | 'amusement'
  | 'club'
  | 'restricted'
  | 'palace'
  | 'friend'
  | 'airport'
  | 'landmark'
  | 'desert'
  | 'garage'
  | 'temple'
  | 'garden'
  | 'gateway';

export type LocationConfig = {
  id: WorldLocationId;
  name: string;
  description: string;
  image: ImageSourcePropType;
  x: number;
  y: number;
  width: number;
  height: number;
  enterable: boolean;
  interactionType: LocationInteractionType;
  collisionBox: Rect;
  interactionZone: Rect;
};

export const locationConfigs: Record<WorldLocationId, LocationConfig> = {
  playerHouse: {
    id: 'playerHouse',
    name: 'Player House',
    description: 'Center mansion safe zone, mission planning base, garden paths, and driveway.',
    image: require('../../assets/locations/player_house.png'),
    x: 2340,
    y: 1700,
    width: 220,
    height: 170,
    enterable: true,
    interactionType: 'home',
    collisionBox: { x: 2362, y: 1724, width: 176, height: 112 },
    interactionZone: { x: 2310, y: 1660, width: 280, height: 250 },
  },
  boatingDock: {
    id: 'boatingDock',
    name: 'Boating',
    description: 'Lake dock, boats, ticket counter, benches, and ship ride mission point.',
    image: require('../../assets/locations/boating.png'),
    x: 250,
    y: 350,
    width: 260,
    height: 190,
    enterable: true,
    interactionType: 'boat',
    collisionBox: { x: 274, y: 376, width: 210, height: 118 },
    interactionZone: { x: 214, y: 312, width: 330, height: 270 },
  },
  magicCity: {
    id: 'magicCity',
    name: 'Magic City',
    description: 'Amusement ride zone with crowds, colorful paths, and mission stunts.',
    image: require('../../assets/locations/magic_city.png'),
    x: 1560,
    y: 310,
    width: 290,
    height: 210,
    enterable: true,
    interactionType: 'amusement',
    collisionBox: { x: 1590, y: 344, width: 230, height: 132 },
    interactionZone: { x: 1520, y: 272, width: 370, height: 290 },
  },
  partyPartyYeah: {
    id: 'partyPartyYeah',
    name: 'Party Party Yeah',
    description: 'Neon club with stage, dancers, VIP boss seating, tables, and mission meetings.',
    image: require('../../assets/locations/party_party_yeah.png'),
    x: 3350,
    y: 320,
    width: 330,
    height: 230,
    enterable: true,
    interactionType: 'club',
    collisionBox: { x: 3385, y: 356, width: 260, height: 146 },
    interactionZone: { x: 3308, y: 278, width: 420, height: 325 },
  },
  policeStation: {
    id: 'policeStation',
    name: 'Police Station',
    description: 'Restricted police building with checkpoint, jeep, officers, and whistle patrol.',
    image: require('../../assets/locations/police_station.png'),
    x: 4650,
    y: 560,
    width: 260,
    height: 190,
    enterable: false,
    interactionType: 'restricted',
    collisionBox: { x: 4678, y: 588, width: 205, height: 122 },
    interactionZone: { x: 4610, y: 518, width: 340, height: 270 },
  },
  raniRajMahal: {
    id: 'raniRajMahal',
    name: 'Rani-Raj Mahal',
    description: 'Grand palace with elegant walkways, guards, and elite mission rooms.',
    image: require('../../assets/locations/rani_raj_mahal.png'),
    x: 3800,
    y: 1450,
    width: 330,
    height: 230,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 3835, y: 1482, width: 260, height: 150 },
    interactionZone: { x: 3760, y: 1408, width: 420, height: 320 },
  },
  friendsHouse: {
    id: 'friendsHouse',
    name: 'Friends House',
    description: 'Arion Vale strategy house with living room talk scene and Boss meeting area.',
    image: require('../../assets/locations/friends_house.png'),
    x: 900,
    y: 1720,
    width: 230,
    height: 165,
    enterable: true,
    interactionType: 'friend',
    collisionBox: { x: 928, y: 1746, width: 176, height: 100 },
    interactionZone: { x: 860, y: 1682, width: 310, height: 245 },
  },
  pinkPalace: {
    id: 'pinkPalace',
    name: 'Pink Palace',
    description: 'Guarded luxury palace with front road, gardens, security posts, and missions.',
    image: require('../../assets/locations/pink_palace.png'),
    x: 4200,
    y: 2550,
    width: 300,
    height: 210,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 4234, y: 2582, width: 232, height: 135 },
    interactionZone: { x: 4160, y: 2508, width: 385, height: 295 },
  },
  airport: {
    id: 'airport',
    name: 'Airport',
    description: 'Runway, hangar, plane seats, parachute travel, and city-wide flight system.',
    image: require('../../assets/locations/airport.png'),
    x: 350,
    y: 2850,
    width: 360,
    height: 250,
    enterable: true,
    interactionType: 'airport',
    collisionBox: { x: 388, y: 2888, width: 284, height: 158 },
    interactionZone: { x: 300, y: 2800, width: 460, height: 350 },
  },
  clockTower: {
    id: 'clockTower',
    name: 'Clock Tower',
    description: 'Large city landmark with crossing, guards, and exploration floors.',
    image: require('../../assets/locations/clock_tower.png'),
    x: 2450,
    y: 3100,
    width: 240,
    height: 210,
    enterable: true,
    interactionType: 'landmark',
    collisionBox: { x: 2478, y: 3135, width: 184, height: 130 },
    interactionZone: { x: 2410, y: 3060, width: 320, height: 290 },
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    description: 'Large sand zone with camel rides, routes, exploration space, and deep oasis.',
    image: require('../../assets/locations/desert.png'),
    x: 4350,
    y: 3350,
    width: 520,
    height: 250,
    enterable: true,
    interactionType: 'desert',
    collisionBox: { x: 4404, y: 3388, width: 410, height: 154 },
    interactionZone: { x: 4290, y: 3300, width: 620, height: 350 },
  },
  garage: {
    id: 'garage',
    name: 'Garage',
    description: 'Vehicle hub with cars, SUVs, bikes, bicycles, and selection space.',
    image: require('../../assets/locations/garage.png'),
    x: 2200,
    y: 980,
    width: 210,
    height: 150,
    enterable: true,
    interactionType: 'garage',
    collisionBox: { x: 2225, y: 1003, width: 160, height: 92 },
    interactionZone: { x: 2160, y: 942, width: 290, height: 230 },
  },
  roseTemple: {
    id: 'roseTemple',
    name: 'Rose Temple',
    description: 'Beautiful temple grounds with rose paths, lamps, guards, and shrine missions.',
    image: require('../../assets/locations/rose_temple.png'),
    x: 3150,
    y: 3250,
    width: 260,
    height: 190,
    enterable: true,
    interactionType: 'temple',
    collisionBox: { x: 3179, y: 3278, width: 202, height: 120 },
    interactionZone: { x: 3110, y: 3212, width: 340, height: 270 },
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Open garden with sculpture centerpiece, lake, flower area, and wide walkways.',
    image: require('../../assets/locations/garden.png'),
    x: 2350,
    y: 2200,
    width: 270,
    height: 190,
    enterable: true,
    interactionType: 'garden',
    collisionBox: { x: 2384, y: 2230, width: 202, height: 118 },
    interactionZone: { x: 2312, y: 2160, width: 350, height: 270 },
  },
  doorway: {
    id: 'doorway',
    name: 'Doorway',
    description: 'Grand ceremonial arch with guards, lamp posts, front road, and pass-through trigger.',
    image: require('../../assets/locations/doorway.png'),
    x: 3450,
    y: 2250,
    width: 240,
    height: 170,
    enterable: true,
    interactionType: 'gateway',
    collisionBox: { x: 3478, y: 2277, width: 184, height: 108 },
    interactionZone: { x: 3412, y: 2209, width: 320, height: 250 },
  },
};

export const allLocationConfigs = Object.values(locationConfigs);

export function getLocationConfig(id: WorldLocationId) {
  return locationConfigs[id];
}
