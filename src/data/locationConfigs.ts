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
    x: 5600,
    y: 3600,
    width: 900,
    height: 700,
    enterable: true,
    interactionType: 'home',
    collisionBox: { x: 5660, y: 3660, width: 780, height: 560 },
    interactionZone: { x: 5520, y: 3520, width: 960, height: 780 },
  },
  boatingDock: {
    id: 'boatingDock',
    name: 'Boating',
    description: 'Lake dock, boats, ticket counter, benches, and ship ride mission point.',
    image: require('../../assets/locations/boating.png'),
    x: 900,
    y: 700,
    width: 1300,
    height: 900,
    enterable: true,
    interactionType: 'boat',
    collisionBox: { x: 950, y: 750, width: 1200, height: 800,
    },
    interactionZone: { x: 830, y: 630, width: 1440, height: 1040 },
  },
  magicCity: {
    id: 'magicCity',
    name: 'Magic City',
    description: 'Amusement ride zone with crowds, colorful paths, and mission stunts.',
    image: require('../../assets/locations/magic_city.png'),
    x: 3300,
    y: 700,
    width: 1200,
    height: 900,
    enterable: true,
    interactionType: 'amusement',
    collisionBox: { x: 3350, y: 750, width: 1100, height: 800 },
    interactionZone: { x: 3230, y: 630, width: 1340, height: 1040 },
  },
  partyPartyYeah: {
    id: 'partyPartyYeah',
    name: 'Party Party Yeah',
    description: 'Neon club with stage, dancers, VIP boss seating, tables, and mission meetings.',
    image: require('../../assets/locations/party_party_yeah.png'),
    x: 5800,
    y: 700,
    width: 1200,
    height: 900,
    enterable: true,
    interactionType: 'club',
    collisionBox: { x: 5850, y: 750, width: 1100, height: 800 },
    interactionZone: { x: 5730, y: 630, width: 1340, height: 1040 },
  },
  policeStation: {
    id: 'policeStation',
    name: 'Police Station',
    description: 'Restricted police building with checkpoint, jeep, officers, and whistle patrol.',
    image: require('../../assets/locations/police_station.png'),
    x: 8400,
    y: 700,
    width: 1200,
    height: 900,
    enterable: false,
    interactionType: 'restricted',
    collisionBox: { x: 8450, y: 750, width: 1100, height: 800 },
    interactionZone: { x: 8330, y: 630, width: 1340, height: 1040 },
  },
  raniRajMahal: {
    id: 'raniRajMahal',
    name: 'Rani-Raj Mahal',
    description: 'Grand palace with elegant walkways, guards, and elite mission rooms.',
    image: require('../../assets/locations/rani_raj_mahal.png'),
    x: 1200,
    y: 2700,
    width: 1300,
    height: 950,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 1250, y: 2750, width: 1200, height: 850 },
    interactionZone: { x: 1130, y: 2630, width: 1440, height: 1090 },
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
    x: 9900,
    y: 2800,
    width: 1400,
    height: 1000,
    enterable: true,
    interactionType: 'palace',
    collisionBox: { x: 9960, y: 2860, width: 1280, height: 880 },
    interactionZone: { x: 9820, y: 2720, width: 1560, height: 1160 },
  },
  airport: {
    id: 'airport',
    name: 'Airport',
    description: 'Runway, hangar, plane seats, parachute travel, and city-wide flight system.',
    image: require('../../assets/locations/airport.png'),
    x: 700,
    y: 5200,
    width: 1700,
    height: 1000,
    enterable: true,
    interactionType: 'airport',
    collisionBox: { x: 760, y: 5260, width: 1580, height: 880 },
    interactionZone: { x: 600, y: 5100, width: 1900, height: 1200 },
  },
  clockTower: {
    id: 'clockTower',
    name: 'Clock Tower',
    description: 'Large city landmark with crossing, guards, and exploration floors.',
    image: require('../../assets/locations/clock_tower.png'),
    x: 7000,
    y: 5200,
    width: 1000,
    height: 900,
    enterable: true,
    interactionType: 'landmark',
    collisionBox: { x: 7050, y: 5250, width: 900, height: 800 },
    interactionZone: { x: 6920, y: 5120, width: 1160, height: 1060 },
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    description: 'Large sand zone with camel rides, routes, exploration space, and deep oasis.',
    image: require('../../assets/locations/desert.png'),
    x: 9300,
    y: 5000,
    width: 2300,
    height: 2200,
    enterable: true,
    interactionType: 'desert',
    collisionBox: { x: 9360, y: 5060, width: 2180, height: 2080 },
    interactionZone: { x: 9220, y: 4920, width: 2460, height: 2360 },
  },
  garage: {
    id: 'garage',
    name: 'Garage',
    description: 'Vehicle hub with cars, SUVs, bikes, bicycles, and selection space.',
    image: require('../../assets/locations/garage.png'),
    x: 900,
    y: 7000,
    width: 1200,
    height: 800,
    enterable: true,
    interactionType: 'garage',
    collisionBox: { x: 950, y: 7040, width: 1100, height: 700 },
    interactionZone: { x: 830, y: 6920, width: 1340, height: 940 },
  },
  roseTemple: {
    id: 'roseTemple',
    name: 'Rose Temple',
    description: 'Beautiful temple grounds with rose paths, lamps, guards, and shrine missions.',
    image: require('../../assets/locations/rose_temple.png'),
    x: 3300,
    y: 6900,
    width: 1200,
    height: 850,
    enterable: true,
    interactionType: 'temple',
    collisionBox: { x: 3350, y: 6950, width: 1100, height: 750 },
    interactionZone: { x: 3230, y: 6820, width: 1340, height: 1010 },
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    description: 'Open garden with sculpture centerpiece, lake, flower area, and wide walkways.',
    image: require('../../assets/locations/garden.png'),
    x: 5700,
    y: 6900,
    width: 1300,
    height: 850,
    enterable: true,
    interactionType: 'garden',
    collisionBox: { x: 5750, y: 6950, width: 1200, height: 750 },
    interactionZone: { x: 5630, y: 6820, width: 1440, height: 1010 },
  },
  doorway: {
    id: 'doorway',
    name: 'Doorway',
    description: 'Grand ceremonial arch with guards, lamp posts, front road, and pass-through trigger.',
    image: require('../../assets/locations/doorway.png'),
    x: 8300,
    y: 6900,
    width: 1200,
    height: 850,
    enterable: true,
    interactionType: 'gateway',
    collisionBox: { x: 8350, y: 6950, width: 1100, height: 750 },
    interactionZone: { x: 8230, y: 6820, width: 1340, height: 1010 },
  },
};

export const allLocationConfigs = Object.values(locationConfigs);

export function getLocationConfig(id: WorldLocationId) {
  return locationConfigs[id];
}
