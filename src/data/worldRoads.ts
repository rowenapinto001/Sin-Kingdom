import {
  createBridge,
  createCrosswalk,
  createCurvedRoad,
  createIntersection,
  createRoadSign,
  createStraightRoad,
  createStreetLamp,
} from '../world/roadSystem';
import { ROAD_WIDTH, RoadDecoration } from '../world/roadTiles';
import { WorldObject } from '../world/worldTypes';
import { bridgeConfigs } from './bridgeConfigs';

const highway = { width: 96, color: '#22272f' };
const districtRoad = { width: 78, color: '#252a32' };

const mainRoads: WorldObject[] = [
  ...createCurvedRoad('road-north-gardenway', 'North Gardenway', [
    { x: 380, y: 560 },
    { x: 760, y: 472 },
    { x: 1220, y: 618 },
    { x: 1705, y: 560 },
    { x: 2100, y: 458 },
    { x: 2475, y: 560 },
    { x: 3030, y: 662 },
    { x: 3520, y: 560 },
    { x: 4140, y: 468 },
    { x: 4750, y: 560 },
  ], highway),
  ...createCurvedRoad('road-west-airport-greenway', 'Airport Greenway', [
    { x: 560, y: 560 },
    { x: 430, y: 980 },
    { x: 650, y: 1360 },
    { x: 560, y: 1815 },
    { x: 710, y: 2600 },
    { x: 560, y: 4300 },
    { x: 760, y: 5850 },
    { x: 560, y: 7100 },
  ], highway),
  ...createCurvedRoad('road-central-s-avenue', 'Empire S Avenue', [
    { x: 2475, y: 560 },
    { x: 2610, y: 980 },
    { x: 2380, y: 1360 },
    { x: 2475, y: 1885 },
    { x: 2400, y: 3285 },
    { x: 2220, y: 4700 },
    { x: 3150, y: 6100 },
    { x: 4050, y: 7200 },
  ], highway),
  ...createCurvedRoad('road-royal-s-curve', 'Royal S Curve', [
    { x: 3920, y: 1565 },
    { x: 3740, y: 1890 },
    { x: 4200, y: 3650 },
    { x: 4300, y: 5550 },
    { x: 4050, y: 7200 },
  ], districtRoad),
  ...createCurvedRoad('road-garden-doorway-longway', 'Garden Doorway Longway', [
    { x: 4050, y: 7200 },
    { x: 4300, y: 7520 },
    { x: 4460, y: 7780 },
    { x: 4680, y: 8095 },
  ], highway),
  ...createCurvedRoad('road-doorway-east-loop', 'Doorway East Loop', [
    { x: 4680, y: 8095 },
    { x: 4960, y: 7600 },
    { x: 4820, y: 6600 },
    { x: 4300, y: 5550 },
  ], districtRoad),
  ...createCurvedRoad('road-south-long-parkway', 'South Long Parkway', [
    { x: 560, y: 7100 },
    { x: 1150, y: 7000 },
    { x: 1900, y: 6600 },
    { x: 3150, y: 6100 },
    { x: 4050, y: 7200 },
    { x: 4680, y: 8095 },
  ], highway),

  ...createCurvedRoad('road-boating-entry', 'Lake Entry Road', [
    { x: 380, y: 560 },
    { x: 330, y: 500 },
    { x: 380, y: 445 },
  ], districtRoad),
  ...createCurvedRoad('road-magic-entry', 'Magic City Entry', [
    { x: 1705, y: 560 },
    { x: 1635, y: 490 },
    { x: 1705, y: 420 },
  ], districtRoad),
  ...createCurvedRoad('road-garage-entry', 'Garage Entry', [
    { x: 2305, y: 560 },
    { x: 2185, y: 1120 },
    { x: 2155, y: 1975 },
  ], districtRoad),
  ...createCurvedRoad('road-party-entry', 'Club Entry', [
    { x: 3520, y: 560 },
    { x: 3605, y: 500 },
    { x: 3520, y: 440 },
  ], districtRoad),
  ...createCurvedRoad('road-police-entry', 'Police Entry', [
    { x: 4750, y: 560 },
    { x: 4685, y: 625 },
    { x: 4750, y: 690 },
  ], districtRoad),
  ...createCurvedRoad('road-friends-city-connector', 'Friends City Connector', [
    bridgeConfigs['bridge-friends-canal'].endPoint,
    { x: 1620, y: 1815 },
    { x: 2050, y: 1870 },
    { x: 2475, y: 1885 },
  ], highway),
  ...createCurvedRoad('road-player-house-entry', 'Player House Drive', [
    { x: 2400, y: 3285 },
    { x: 2380, y: 3240 },
    { x: 2450, y: 3200 },
  ], districtRoad),
  ...createCurvedRoad('road-mahal-connector', 'Royal Connector', [
    { x: 3570, y: 1565 },
    { x: 3750, y: 1488 },
    { x: 3920, y: 1565 },
  ], districtRoad),
  ...createCurvedRoad('road-friends-player-link', 'Friends to Player Link', [
    { x: 2475, y: 1885 },
    { x: 2300, y: 2500 },
    { x: 2400, y: 3285 },
  ], districtRoad),
  ...createStraightRoad('road-airport-runway-strip', 'Airport Runway', { x: 300, y: 7446 }, { x: 1230, y: 7446 }, { width: 70, color: '#202833', sidewalks: false }),
  ...createStraightRoad('road-garage-lot-strip', 'Garage Lot', { x: 2030, y: 1877 }, { x: 2330, y: 1877 }, { width: 74, color: '#2b2d34', sidewalks: false }),
];

const intersections: WorldObject[] = [
  ...createIntersection('intersection-boating', { x: 380, y: 560 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-magic', { x: 1705, y: 560 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-garage-north', { x: 2305, y: 560 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-central-north', { x: 2475, y: 560 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-party', { x: 3520, y: 560 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-police', { x: 4750, y: 560 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-airport', { x: 560, y: 7100 }, ROAD_WIDTH * 1.5),
  ...createIntersection('intersection-player-house', { x: 2475, y: 1885 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-player-south', { x: 2400, y: 3285 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-clock', { x: 2220, y: 4700 }, ROAD_WIDTH * 1.4),
  ...createIntersection('intersection-temple', { x: 3150, y: 6100 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-garden-route', { x: 4050, y: 7200 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-doorway', { x: 4680, y: 8095 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-mahal', { x: 3920, y: 1565 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-pink-palace', { x: 4200, y: 3650 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-desert-road', { x: 4300, y: 5550 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-garden-mid', { x: 1900, y: 6600 }, ROAD_WIDTH * 1.35),
];

const bridgeRoads: WorldObject[] = createBridge(
  bridgeConfigs['bridge-friends-canal'].id,
  bridgeConfigs['bridge-friends-canal'].name,
  {
    x: bridgeConfigs['bridge-friends-canal'].bounds.x + bridgeConfigs['bridge-friends-canal'].bounds.width / 2,
    y: bridgeConfigs['bridge-friends-canal'].bounds.y + bridgeConfigs['bridge-friends-canal'].bounds.height / 2,
  },
  bridgeConfigs['bridge-friends-canal'].bounds.width,
  bridgeConfigs['bridge-friends-canal'].bounds.height,
  '0deg',
);

export const worldRoadObjects: WorldObject[] = [...mainRoads, ...intersections, ...bridgeRoads];

export const worldRoadDecorations: RoadDecoration[] = [
  createCrosswalk('crosswalk-boating', { x: 380, y: 560 }),
  createCrosswalk('crosswalk-magic', { x: 1705, y: 560 }),
  createCrosswalk('crosswalk-garage', { x: 2155, y: 1975 }, false),
  createCrosswalk('crosswalk-party', { x: 3520, y: 560 }),
  createCrosswalk('crosswalk-police', { x: 4750, y: 690 }, false),
  createCrosswalk('crosswalk-player-house', { x: 2400, y: 3285 }),
  createCrosswalk('crosswalk-garden', { x: 4050, y: 7200 }, false),
  createCrosswalk('crosswalk-doorway', { x: 4680, y: 8095 }, false),
  createCrosswalk('crosswalk-mahal', { x: 3920, y: 1565 }, false),
  createCrosswalk('crosswalk-pink-palace', { x: 4200, y: 3650 }),
  createCrosswalk('crosswalk-airport', { x: 560, y: 7100 }),
  createCrosswalk('crosswalk-clock', { x: 2220, y: 4700 }),
  createCrosswalk('crosswalk-temple', { x: 3150, y: 6100 }),
  createCrosswalk('crosswalk-desert', { x: 4300, y: 5550 }, false),
  createStreetLamp('lamp-north-a', { x: 920, y: 492 }),
  createStreetLamp('lamp-north-b', { x: 2180, y: 492 }),
  createStreetLamp('lamp-north-c', { x: 3120, y: 492 }),
  createStreetLamp('lamp-west-a', { x: 624, y: 1110 }),
  createStreetLamp('lamp-west-b', { x: 624, y: 2270 }),
  createStreetLamp('lamp-west-c', { x: 624, y: 4320 }),
  createStreetLamp('lamp-west-d', { x: 624, y: 5860 }),
  createStreetLamp('lamp-west-e', { x: 624, y: 6980 }),
  createStreetLamp('lamp-central-a', { x: 2538, y: 1270 }),
  createStreetLamp('lamp-central-b', { x: 2465, y: 2630 }),
  createStreetLamp('lamp-central-d', { x: 3085, y: 5960 }),
  createStreetLamp('lamp-palace-a', { x: 3984, y: 1980 }),
  createStreetLamp('lamp-garden-route-a', { x: 3860, y: 7040 }),
  createStreetLamp('lamp-garden-route-b', { x: 4310, y: 7550 }),
  createStreetLamp('lamp-doorway-route-a', { x: 4540, y: 7950 }),
  createStreetLamp('lamp-desert-a', { x: 4210, y: 5420 }),
  createStreetLamp('lamp-desert-b', { x: 4680, y: 5680 }),
  createRoadSign('sign-airport', { x: 760, y: 6985 }, 'AIRPORT'),
  createRoadSign('sign-desert', { x: 4310, y: 5440 }, 'DESERT ZONE'),
  createRoadSign('sign-party', { x: 3630, y: 470 }, 'NEON CLUB'),
  createRoadSign('sign-police', { x: 4630, y: 756 }, 'POLICE'),
  createRoadSign('sign-palace', { x: 4040, y: 1665 }, 'ROYAL ZONE'),
  createRoadSign('sign-garden', { x: 3870, y: 7060 }, 'GARDEN DISTRICT'),
  createRoadSign('sign-doorway', { x: 4550, y: 7960 }, 'DOORWAY'),
];
