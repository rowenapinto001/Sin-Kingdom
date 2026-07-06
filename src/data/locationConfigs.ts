import { ImageSourcePropType } from 'react-native';
import { Rect, WorldLocationId } from '../world/worldTypes';
import { friendsHouseExterior } from './friendsHouseExteriorConfig';

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
    y: 3200,
    width: 220,
    height: 170,
    enterable: true,
    interactionType: 'home',
    collisionBox: { x: 2362, y: 3224, width: 176, height: 112 },
    interactionZone: { x: 2310, y: 3160, width: 280, height: 250 },
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
    image: require('../../assets/locations/player_house.png'),
    x: friendsHouseExterior.x,
    y: friendsHouseExterior.y,
    width: friendsHouseExterior.width,
    height: friendsHouseExterior.height,
    enterable: true,
    interactionType: 'friend',
    collisionBox: {
      x: friendsHouseExterior.x + friendsHouseExterior.house.x,
      y: friendsHouseExterior.y + friendsHouseExterior.house.y,
      width: friendsHouseExterior.house.width,
      height: friendsHouseExterior.house.height,
    },
    interactionZone: {
      x: friendsHouseExterior.x + friendsHouseExterior.frontDoorZone.x,
      y: friendsHouseExterior.y + friendsHouseExterior.frontDoorZone.y,
      width: friendsHouseExterior.frontDoorZone.width,
      height: friendsHouseExterior.frontDoorZone.height,
    },
  },
  pinkPalace: {
    id: 'pinkPalace',
    name: 'Pink Palace',
    description: 'Guarded luxury palace with front road, gardens, security posts, and missions.',
    image: require('../../assets/locations/pink_palace.png'),
    x: 4200,
    y: 3650,
    width: 300,
    height: 210,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 4234, y: 3682, width: 232, height: 135 },
    interactionZone: { x: 4160, y: 3608, width: 385, height: 295 },
  },
  airport: {
    id: 'airport',
    name: 'Airport',
    description: 'Runway, hangar, plane seats, parachute travel, and city-wide flight system.',
    image: require('../../assets/locations/airport.png'),
    x: 350,
    y: 7100,
    width: 360,
    height: 250,
    enterable: true,
    interactionType: 'airport',
    collisionBox: { x: 388, y: 7138, width: 284, height: 158 },
    interactionZone: { x: 300, y: 7050, width: 460, height: 350 },
  },
  clockTower: {
    id: 'clockTower',
    name: 'Clock Tower',
    description: 'Large city landmark with crossing, guards, and exploration floors.',
    image: require('../../assets/locations/clock_tower.png'),
    x: 2450,
    y: 4700,
    width: 240,
    height: 210,
    enterable: true,
    interactionType: 'landmark',
    collisionBox: { x: 2478, y: 4735, width: 184, height: 130 },
    interactionZone: { x: 2410, y: 4660, width: 320, height: 290 },
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    description: 'Large sand zone with camel rides, routes, exploration space, and deep oasis.',
    image: require('../../assets/locations/desert.png'),
    x: 4300,
    y: 5550,
    width: 520,
    height: 250,
    enterable: true,
    interactionType: 'desert',
    collisionBox: { x: 4354, y: 5588, width: 410, height: 154 },
    interactionZone: { x: 4240, y: 5500, width: 620, height: 350 },
  },
  garage: {
    id: 'garage',
    name: 'Garage',
    description: 'Vehicle hub with cars, SUVs, bikes, bicycles, and selection space.',
    image: require('../../assets/locations/garage.png'),
    x: 2050,
    y: 1900,
    width: 210,
    height: 150,
    enterable: true,
    interactionType: 'garage',
    collisionBox: { x: 2075, y: 1923, width: 160, height: 92 },
    interactionZone: { x: 2010, y: 1862, width: 290, height: 230 },
  },
  roseTemple: {
    id: 'roseTemple',
    name: 'Rose Temple',
    description: 'Beautiful temple grounds with rose paths, lamps, guards, and shrine missions.',
    image: require('../../assets/locations/rose_temple.png'),
    x: 3150,
    y: 6100,
    width: 260,
    height: 190,
    enterable: true,
    interactionType: 'temple',
    collisionBox: { x: 3179, y: 6128, width: 202, height: 120 },
    interactionZone: { x: 3110, y: 6062, width: 340, height: 270 },
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Open garden with sculpture centerpiece, lake, flower area, and wide walkways.',
    image: require('../../assets/locations/garden.png'),
    x: 3900,
    y: 7100,
    width: 300,
    height: 210,
    enterable: true,
    interactionType: 'garden',
    collisionBox: { x: 3936, y: 7135, width: 226, height: 132 },
    interactionZone: { x: 3850, y: 7048, width: 410, height: 330 },
  },
  doorway: {
    id: 'doorway',
    name: 'Doorway',
    description: 'Grand ceremonial arch with guards, lamp posts, front road, and pass-through trigger.',
    image: require('../../assets/locations/doorway.png'),
    x: 4550,
    y: 8000,
    width: 260,
    height: 190,
    enterable: true,
    interactionType: 'gateway',
    collisionBox: { x: 4582, y: 8030, width: 198, height: 122 },
    interactionZone: { x: 4498, y: 7948, width: 370, height: 300 },
  },
};

export const allLocationConfigs = Object.values(locationConfigs);

export function getLocationConfig(id: WorldLocationId) {
  return locationConfigs[id];
}
