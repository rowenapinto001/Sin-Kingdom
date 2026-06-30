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
    x: 990,
    y: 690,
    width: 220,
    height: 170,
    enterable: true,
    interactionType: 'home',
    collisionBox: { x: 1012, y: 714, width: 176, height: 112 },
    interactionZone: { x: 960, y: 650, width: 280, height: 250 },
  },
  boatingDock: {
    id: 'boatingDock',
    name: 'Boating',
    description: 'Lake dock, boats, ticket counter, benches, and ship ride mission point.',
    image: require('../../assets/locations/boating.png'),
    x: 118,
    y: 280,
    width: 260,
    height: 190,
    enterable: true,
    interactionType: 'boat',
    collisionBox: { x: 142, y: 306, width: 210, height: 118 },
    interactionZone: { x: 82, y: 242, width: 330, height: 270 },
  },
  magicCity: {
    id: 'magicCity',
    name: 'Magic City',
    description: 'Amusement ride zone with crowds, colorful paths, and mission stunts.',
    image: require('../../assets/locations/magic_city.png'),
    x: 650,
    y: 150,
    width: 290,
    height: 210,
    enterable: true,
    interactionType: 'amusement',
    collisionBox: { x: 680, y: 184, width: 230, height: 132 },
    interactionZone: { x: 610, y: 112, width: 370, height: 290 },
  },
  partyPartyYeah: {
    id: 'partyPartyYeah',
    name: 'Party Party Yeah',
    description: 'Neon club with stage, dancers, VIP boss seating, tables, and mission meetings.',
    image: require('../../assets/locations/party_party_yeah.png'),
    x: 1280,
    y: 118,
    width: 330,
    height: 230,
    enterable: true,
    interactionType: 'club',
    collisionBox: { x: 1315, y: 154, width: 260, height: 146 },
    interactionZone: { x: 1238, y: 76, width: 420, height: 325 },
  },
  policeStation: {
    id: 'policeStation',
    name: 'Police Station',
    description: 'Restricted police building with checkpoint, jeep, officers, and whistle patrol.',
    image: require('../../assets/locations/police_station.png'),
    x: 1750,
    y: 220,
    width: 260,
    height: 190,
    enterable: false,
    interactionType: 'restricted',
    collisionBox: { x: 1778, y: 248, width: 205, height: 122 },
    interactionZone: { x: 1710, y: 178, width: 340, height: 270 },
  },
  raniRajMahal: {
    id: 'raniRajMahal',
    name: 'Rani-Raj Mahal',
    description: 'Grand palace with elegant walkways, guards, and elite mission rooms.',
    image: require('../../assets/locations/rani_raj_mahal.png'),
    x: 1420,
    y: 570,
    width: 330,
    height: 230,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 1455, y: 602, width: 260, height: 150 },
    interactionZone: { x: 1380, y: 528, width: 420, height: 320 },
  },
  friendsHouse: {
    id: 'friendsHouse',
    name: 'Friends House',
    description: 'Arion Vale strategy house with living room talk scene and Boss meeting area.',
    image: require('../../assets/locations/friends_house.png'),
    x: 520,
    y: 640,
    width: 230,
    height: 165,
    enterable: true,
    interactionType: 'friend',
    collisionBox: { x: 548, y: 666, width: 176, height: 100 },
    interactionZone: { x: 480, y: 602, width: 310, height: 245 },
  },
  pinkPalace: {
    id: 'pinkPalace',
    name: 'Pink Palace',
    description: 'Guarded luxury palace with front road, gardens, security posts, and missions.',
    image: require('../../assets/locations/pink_palace.png'),
    x: 1580,
    y: 1000,
    width: 300,
    height: 210,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 1614, y: 1032, width: 232, height: 135 },
    interactionZone: { x: 1540, y: 958, width: 385, height: 295 },
  },
  airport: {
    id: 'airport',
    name: 'Airport',
    description: 'Runway, hangar, plane seats, parachute travel, and city-wide flight system.',
    image: require('../../assets/locations/airport.png'),
    x: 220,
    y: 980,
    width: 360,
    height: 250,
    enterable: true,
    interactionType: 'airport',
    collisionBox: { x: 258, y: 1018, width: 284, height: 158 },
    interactionZone: { x: 170, y: 930, width: 460, height: 350 },
  },
  clockTower: {
    id: 'clockTower',
    name: 'Clock Tower',
    description: 'Large city landmark with crossing, guards, and exploration floors.',
    image: require('../../assets/locations/clock_tower.png'),
    x: 930,
    y: 1110,
    width: 240,
    height: 210,
    enterable: true,
    interactionType: 'landmark',
    collisionBox: { x: 958, y: 1145, width: 184, height: 130 },
    interactionZone: { x: 890, y: 1070, width: 320, height: 290 },
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    description: 'Large sand zone with camel rides, routes, exploration space, and deep oasis.',
    image: require('../../assets/locations/desert.png'),
    x: 1710,
    y: 1320,
    width: 420,
    height: 230,
    enterable: true,
    interactionType: 'desert',
    collisionBox: { x: 1754, y: 1355, width: 332, height: 142 },
    interactionZone: { x: 1660, y: 1278, width: 520, height: 310 },
  },
  garage: {
    id: 'garage',
    name: 'Garage',
    description: 'Vehicle hub with cars, SUVs, bikes, bicycles, and selection space.',
    image: require('../../assets/locations/garage.png'),
    x: 790,
    y: 500,
    width: 210,
    height: 150,
    enterable: true,
    interactionType: 'garage',
    collisionBox: { x: 815, y: 523, width: 160, height: 92 },
    interactionZone: { x: 750, y: 462, width: 290, height: 230 },
  },
  roseTemple: {
    id: 'roseTemple',
    name: 'Rose Temple',
    description: 'Beautiful temple grounds with rose paths, lamps, guards, and shrine missions.',
    image: require('../../assets/locations/rose_temple.png'),
    x: 1120,
    y: 1220,
    width: 260,
    height: 190,
    enterable: true,
    interactionType: 'temple',
    collisionBox: { x: 1149, y: 1248, width: 202, height: 120 },
    interactionZone: { x: 1080, y: 1182, width: 340, height: 270 },
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Open garden with sculpture centerpiece, lake, flower area, and wide walkways.',
    image: require('../../assets/locations/garden.png'),
    x: 790,
    y: 870,
    width: 270,
    height: 190,
    enterable: true,
    interactionType: 'garden',
    collisionBox: { x: 824, y: 900, width: 202, height: 118 },
    interactionZone: { x: 752, y: 830, width: 350, height: 270 },
  },
  doorway: {
    id: 'doorway',
    name: 'Doorway',
    description: 'Grand ceremonial arch with guards, lamp posts, front road, and pass-through trigger.',
    image: require('../../assets/locations/doorway.png'),
    x: 1370,
    y: 865,
    width: 240,
    height: 170,
    enterable: true,
    interactionType: 'gateway',
    collisionBox: { x: 1398, y: 892, width: 184, height: 108 },
    interactionZone: { x: 1332, y: 824, width: 320, height: 250 },
  },
};

export const allLocationConfigs = Object.values(locationConfigs);

export function getLocationConfig(id: WorldLocationId) {
  return locationConfigs[id];
}
