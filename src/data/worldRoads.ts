import {
  createCrosswalk,
  createCurvedRoad,
  createIntersection,
  createRoadSign,
  createStraightRoad,
  createStreetLamp,
} from '../world/roadSystem';
import { ROAD_WIDTH, RoadDecoration } from '../world/roadTiles';
import { WorldObject } from '../world/worldTypes';

const highway = { width: 96, color: '#22272f' };
const districtRoad = { width: 78, color: '#252a32' };

// Road density is kept modest on purpose (a handful of long connectors plus a
// few key junctions) for render performance across the much larger
// 12000x8000 world - not a dense street grid.
const mainRoads: WorldObject[] = [
  // 1. North main road: Boating -> Magic City -> Party Party Yeah -> Police Station, y ~ 1150
  ...createCurvedRoad('road-north-main', 'North Main Road', [
    { x: 1550, y: 1150 },
    { x: 3900, y: 1150 },
    { x: 6400, y: 1150 },
    { x: 9000, y: 1150 },
  ], highway),

  // 2. Central main road: Rani-Raj Mahal -> Player House -> Friends House -> Pink Palace, y ~ 3300-3500
  ...createCurvedRoad('road-central-main', 'Central Main Road', [
    { x: 1850, y: 3300 },
    { x: 4000, y: 3400 },
    { x: 6050, y: 3500 },
    { x: 8300, y: 3400 },
    { x: 10600, y: 3300 },
  ], highway),

  // 3. South main road: Garage -> Rose Temple -> Garden -> Doorway, y ~ 6800
  ...createCurvedRoad('road-south-main', 'South Main Road', [
    { x: 1500, y: 6800 },
    { x: 3900, y: 6800 },
    { x: 6350, y: 6800 },
    { x: 8900, y: 6800 },
  ], highway),

  // 4. West vertical road: Boating -> Rani-Raj Mahal -> Airport -> Garage, x ~ 1500
  ...createCurvedRoad('road-west-vertical', 'West Vertical Road', [
    { x: 1550, y: 1150 },
    { x: 1500, y: 2700 },
    { x: 1550, y: 3300 },
    { x: 1500, y: 5700 },
    { x: 1500, y: 6800 },
  ], highway),

  // 5. Center vertical road: Magic City -> Player House -> Garden, x ~ 4000-4500
  ...createCurvedRoad('road-center-vertical', 'Center Vertical Road', [
    { x: 3900, y: 1150 },
    { x: 4000, y: 3400 },
    { x: 4300, y: 5700 },
    { x: 6350, y: 6800 },
  ], highway),

  // 6. East vertical road: Police Station -> Pink Palace -> Desert -> Doorway, x ~ 9000-9500
  ...createCurvedRoad('road-east-vertical', 'East Vertical Road', [
    { x: 9000, y: 1150 },
    { x: 9500, y: 2800 },
    { x: 10600, y: 3300 },
    { x: 10450, y: 5700 },
    { x: 8900, y: 6800 },
  ], highway),

  // 7. Airport highway: Airport -> Player House -> Clock Tower
  ...createCurvedRoad('road-airport-highway', 'Airport Highway', [
    { x: 1550, y: 5700 },
    { x: 4000, y: 5900 },
    { x: 6050, y: 5600 },
    { x: 7500, y: 5700 },
  ], districtRoad),

  // 8. Desert road: Pink Palace -> Desert -> Oasis Lake
  ...createCurvedRoad('road-desert', 'Desert Road', [
    { x: 10600, y: 3300 },
    { x: 10450, y: 5700 },
    { x: 9560, y: 7380 },
  ], districtRoad),

  // District entry spurs connecting the main roads to each location's front door.
  ...createCurvedRoad('road-boating-entry', 'Boating Entry', [
    { x: 1550, y: 1150 },
    { x: 1550, y: 1300 },
  ], districtRoad),
  ...createCurvedRoad('road-magic-entry', 'Magic City Entry', [
    { x: 3900, y: 1150 },
    { x: 3900, y: 1300 },
  ], districtRoad),
  ...createCurvedRoad('road-party-entry', 'Party Entry', [
    { x: 6400, y: 1150 },
    { x: 6400, y: 1300 },
  ], districtRoad),
  ...createCurvedRoad('road-police-entry', 'Police Entry', [
    { x: 9000, y: 1150 },
    { x: 9000, y: 1300 },
  ], districtRoad),
  ...createCurvedRoad('road-mahal-entry', 'Mahal Entry', [
    { x: 1850, y: 3300 },
    { x: 1850, y: 3150 },
  ], districtRoad),
  ...createCurvedRoad('road-player-house-entry', 'Player House Entry', [
    { x: 6050, y: 3500 },
    { x: 6050, y: 3600 },
  ], districtRoad),
  ...createCurvedRoad('road-friends-entry', 'Friends House Entry', [
    { x: 8300, y: 3400 },
    { x: 8300, y: 3550 },
  ], districtRoad),
  ...createCurvedRoad('road-pink-palace-entry', 'Pink Palace Entry', [
    { x: 10600, y: 3300 },
    { x: 10600, y: 3200 },
  ], districtRoad),
  ...createCurvedRoad('road-airport-entry', 'Airport Entry', [
    { x: 1550, y: 5700 },
    { x: 1550, y: 5900 },
  ], districtRoad),
  ...createCurvedRoad('road-clock-entry', 'Clock Tower Entry', [
    { x: 7500, y: 5700 },
    { x: 7500, y: 5850 },
  ], districtRoad),
  ...createCurvedRoad('road-garage-entry', 'Garage Entry', [
    { x: 1500, y: 6800 },
    { x: 1500, y: 6950 },
  ], districtRoad),
  ...createCurvedRoad('road-temple-entry', 'Rose Temple Entry', [
    { x: 3900, y: 6800 },
    { x: 3900, y: 6900 },
  ], districtRoad),
  ...createCurvedRoad('road-garden-entry', 'Garden Entry', [
    { x: 6350, y: 6800 },
    { x: 6350, y: 6900 },
  ], districtRoad),
  ...createCurvedRoad('road-doorway-entry', 'Doorway Entry', [
    { x: 8900, y: 6800 },
    { x: 8900, y: 6900 },
  ], districtRoad),

  ...createStraightRoad('road-airport-runway-strip', 'Airport Runway', { x: 750, y: 5895 }, { x: 2150, y: 5895 }, { width: 90, color: '#202833', sidewalks: false }),
  ...createStraightRoad('road-garage-lot-strip', 'Garage Lot', { x: 1000, y: 7387 }, { x: 1300, y: 7387 }, { width: 74, color: '#2b2d34', sidewalks: false }),
];

const intersections: WorldObject[] = [
  ...createIntersection('intersection-boating', { x: 1550, y: 1150 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-magic', { x: 3900, y: 1150 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-party', { x: 6400, y: 1150 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-police', { x: 9000, y: 1150 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-mahal', { x: 1850, y: 3300 }, ROAD_WIDTH * 1.4),
  ...createIntersection('intersection-player-house', { x: 6050, y: 3500 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-friends', { x: 8300, y: 3400 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-pink-palace', { x: 10600, y: 3300 }, ROAD_WIDTH * 1.4),
  ...createIntersection('intersection-airport', { x: 1550, y: 5700 }, ROAD_WIDTH * 1.5),
  ...createIntersection('intersection-clock', { x: 7500, y: 5700 }, ROAD_WIDTH * 1.4),
  ...createIntersection('intersection-desert', { x: 10450, y: 5700 }, ROAD_WIDTH * 1.45),
  ...createIntersection('intersection-garage', { x: 1500, y: 6800 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-temple', { x: 3900, y: 6800 }, ROAD_WIDTH * 1.35),
  ...createIntersection('intersection-garden', { x: 6350, y: 6800 }, ROAD_WIDTH * 1.4),
  ...createIntersection('intersection-doorway', { x: 8900, y: 6800 }, ROAD_WIDTH * 1.35),
];

export const worldRoadObjects: WorldObject[] = [...mainRoads, ...intersections];

export const worldRoadDecorations: RoadDecoration[] = [
  createCrosswalk('crosswalk-boating', { x: 1550, y: 1150 }),
  createCrosswalk('crosswalk-magic', { x: 3900, y: 1150 }),
  createCrosswalk('crosswalk-party', { x: 6400, y: 1150 }),
  createCrosswalk('crosswalk-police', { x: 9000, y: 1150 }, false),
  createCrosswalk('crosswalk-mahal', { x: 1850, y: 3300 }, false),
  createCrosswalk('crosswalk-player-house', { x: 6050, y: 3500 }),
  createCrosswalk('crosswalk-friends', { x: 8300, y: 3400 }, false),
  createCrosswalk('crosswalk-pink-palace', { x: 10600, y: 3300 }),
  createCrosswalk('crosswalk-airport', { x: 1550, y: 5700 }),
  createCrosswalk('crosswalk-clock', { x: 7500, y: 5700 }),
  createCrosswalk('crosswalk-desert', { x: 10450, y: 5700 }, false),
  createCrosswalk('crosswalk-garage', { x: 1500, y: 6800 }, false),
  createCrosswalk('crosswalk-temple', { x: 3900, y: 6800 }),
  createCrosswalk('crosswalk-garden', { x: 6350, y: 6800 }, false),
  createCrosswalk('crosswalk-doorway', { x: 8900, y: 6800 }, false),

  createStreetLamp('lamp-north-a', { x: 2400, y: 1090 }),
  createStreetLamp('lamp-north-b', { x: 5100, y: 1090 }),
  createStreetLamp('lamp-north-c', { x: 7700, y: 1090 }),
  createStreetLamp('lamp-west-a', { x: 1560, y: 1900 }),
  createStreetLamp('lamp-west-b', { x: 1550, y: 4500 }),
  createStreetLamp('lamp-west-c', { x: 1500, y: 6100 }),
  createStreetLamp('lamp-central-a', { x: 2900, y: 3350 }),
  createStreetLamp('lamp-central-b', { x: 5000, y: 3450 }),
  createStreetLamp('lamp-central-c', { x: 7200, y: 3450 }),
  createStreetLamp('lamp-central-d', { x: 9500, y: 3350 }),
  createStreetLamp('lamp-east-a', { x: 9700, y: 2000 }),
  createStreetLamp('lamp-east-b', { x: 10500, y: 4500 }),
  createStreetLamp('lamp-airport-a', { x: 2800, y: 5820 }),
  createStreetLamp('lamp-airport-b', { x: 5200, y: 5780 }),
  createStreetLamp('lamp-south-a', { x: 2700, y: 6740 }),
  createStreetLamp('lamp-south-b', { x: 5100, y: 6740 }),
  createStreetLamp('lamp-south-c', { x: 7600, y: 6740 }),
  createStreetLamp('lamp-desert-a', { x: 10480, y: 4900 }),
  createStreetLamp('lamp-desert-b', { x: 9700, y: 6600 }),

  createRoadSign('sign-boating', { x: 1650, y: 1250 }, 'BOATING DOCK'),
  createRoadSign('sign-airport', { x: 1650, y: 5900 }, 'AIRPORT'),
  createRoadSign('sign-desert', { x: 9700, y: 7250 }, 'DESERT ZONE'),
  createRoadSign('sign-party', { x: 6500, y: 1250 }, 'NEON CLUB'),
  createRoadSign('sign-police', { x: 9100, y: 1250 }, 'POLICE'),
  createRoadSign('sign-palace', { x: 10500, y: 3150 }, 'ROYAL ZONE'),
  createRoadSign('sign-garden', { x: 6450, y: 6900 }, 'GARDEN DISTRICT'),
  createRoadSign('sign-doorway', { x: 9000, y: 6900 }, 'DOORWAY'),
];
