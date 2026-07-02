import { CROSSWALK_SIZE, RoadDecoration, RoadPoint, ROAD_WIDTH, SIDEWALK_WIDTH } from './roadTiles';
import { WorldObject } from './worldTypes';

type RoadOptions = {
  width?: number;
  color?: string;
  sidewalks?: boolean;
};

function roadSegment(id: string, label: string, from: RoadPoint, to: RoadPoint, options: RoadOptions = {}): WorldObject[] {
  const width = options.width ?? ROAD_WIDTH;
  const color = options.color ?? '#2c2f38';
  const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
  const x = horizontal ? Math.min(from.x, to.x) : from.x - width / 2;
  const y = horizontal ? from.y - width / 2 : Math.min(from.y, to.y);
  const roadWidth = horizontal ? Math.abs(to.x - from.x) + width : width;
  const roadHeight = horizontal ? width : Math.abs(to.y - from.y) + width;
  const segment: WorldObject = {
    id,
    label,
    kind: 'road',
    x,
    y,
    width: roadWidth,
    height: roadHeight,
    color,
  };

  if (options.sidewalks === false) return [segment];

  const sidewalkA: WorldObject = horizontal
    ? {
        id: `${id}-sidewalk-a`,
        label: 'Sidewalk',
        kind: 'footpath',
        x,
        y: y - SIDEWALK_WIDTH - 4,
        width: roadWidth,
        height: SIDEWALK_WIDTH,
        color: '#716a78',
      }
    : {
        id: `${id}-sidewalk-a`,
        label: 'Sidewalk',
        kind: 'footpath',
        x: x - SIDEWALK_WIDTH - 4,
        y,
        width: SIDEWALK_WIDTH,
        height: roadHeight,
        color: '#716a78',
      };
  const sidewalkB: WorldObject = horizontal
    ? {
        id: `${id}-sidewalk-b`,
        label: 'Sidewalk',
        kind: 'footpath',
        x,
        y: y + roadHeight + 4,
        width: roadWidth,
        height: SIDEWALK_WIDTH,
        color: '#716a78',
      }
    : {
        id: `${id}-sidewalk-b`,
        label: 'Sidewalk',
        kind: 'footpath',
        x: x + roadWidth + 4,
        y,
        width: SIDEWALK_WIDTH,
        height: roadHeight,
        color: '#716a78',
      };

  return [sidewalkA, sidewalkB, segment];
}

export function createStraightRoad(id: string, label: string, from: RoadPoint, to: RoadPoint, options?: RoadOptions): WorldObject[] {
  return roadSegment(id, label, from, to, options);
}

export function createCornerRoad(id: string, label: string, center: RoadPoint, options: RoadOptions = {}): WorldObject[] {
  const width = options.width ?? ROAD_WIDTH;
  return [
    {
      id,
      label,
      kind: 'road',
      x: center.x - width / 2,
      y: center.y - width / 2,
      width,
      height: width,
      color: options.color ?? '#30323d',
    },
  ];
}

export function createIntersection(id: string, center: RoadPoint, size = ROAD_WIDTH * 1.25): WorldObject[] {
  return [
    {
      id,
      label: 'Intersection',
      kind: 'road',
      x: center.x - size / 2,
      y: center.y - size / 2,
      width: size,
      height: size,
      color: '#282c35',
    },
  ];
}

export function createBridge(id: string, label: string, center: RoadPoint, length: number, width = ROAD_WIDTH * 1.55, rotate = '0deg'): WorldObject[] {
  return [
    {
      id,
      label,
      kind: 'bridge',
      x: center.x - length / 2,
      y: center.y - width / 2,
      width: length,
      height: width,
      color: '#22272f',
      rotate,
    },
  ];
}

export function createZigZagRoad(id: string, label: string, points: RoadPoint[], options: RoadOptions = {}): WorldObject[] {
  if (points.length < 2) return [];
  const segments = points.flatMap((point, index) => {
    const next = points[index + 1];
    if (!next) return [];
    return roadSegment(`${id}-seg-${index}`, label, point, next, options);
  });
  const corners = points.slice(1, -1).flatMap((point, index) => createCornerRoad(`${id}-corner-${index}`, `${label} corner`, point, options));
  return [...segments, ...corners];
}

function angledSegment(id: string, label: string, from: RoadPoint, to: RoadPoint, options: RoadOptions = {}): WorldObject[] {
  const width = options.width ?? ROAD_WIDTH;
  const color = options.color ?? '#2c2f38';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length <= 1) return [];
  const angle = `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const sidewalkWidth = width + SIDEWALK_WIDTH * 2 + 22;
  const sidewalk: WorldObject = {
    id: `${id}-sidewalk`,
    label: 'Sidewalk',
    kind: 'footpath',
    x: midX - length / 2,
    y: midY - sidewalkWidth / 2,
    width: length,
    height: sidewalkWidth,
    color: '#817b78',
    rotate: angle,
  };
  const road: WorldObject = {
    id,
    label,
    kind: 'road',
    x: midX - length / 2,
    y: midY - width / 2,
    width: length,
    height: width,
    color,
    rotate: angle,
  };

  return options.sidewalks === false ? [road] : [sidewalk, road];
}

export function createAngledRoad(id: string, label: string, from: RoadPoint, to: RoadPoint, options: RoadOptions = {}): WorldObject[] {
  return angledSegment(id, label, from, to, options);
}

export function createCurvedRoad(id: string, label: string, points: RoadPoint[], options: RoadOptions = {}): WorldObject[] {
  if (points.length < 2) return [];
  const segments = points.flatMap((point, index) => {
    const next = points[index + 1];
    if (!next) return [];
    return angledSegment(`${id}-curve-${index}`, label, point, next, options);
  });
  const joinSize = (options.width ?? ROAD_WIDTH) + SIDEWALK_WIDTH * 2 + 18;
  const joins = points.slice(1, -1).map<WorldObject>((point, index) => ({
    id: `${id}-join-${index}`,
    label: `${label} joined corner`,
    kind: 'road',
    x: point.x - joinSize / 2,
    y: point.y - joinSize / 2,
    width: joinSize,
    height: joinSize,
    color: options.color ?? '#2c2f38',
  }));
  return [...segments, ...joins];
}

export function createCrosswalk(id: string, center: RoadPoint, horizontal = true): RoadDecoration {
  return {
    id,
    type: 'crosswalk',
    x: center.x - (horizontal ? CROSSWALK_SIZE / 2 : ROAD_WIDTH / 2),
    y: center.y - (horizontal ? ROAD_WIDTH / 2 : CROSSWALK_SIZE / 2),
    width: horizontal ? CROSSWALK_SIZE : ROAD_WIDTH,
    height: horizontal ? ROAD_WIDTH : CROSSWALK_SIZE,
  };
}

export function createTrafficLight(id: string, center: RoadPoint): RoadDecoration {
  return {
    id,
    type: 'trafficLight',
    x: center.x,
    y: center.y,
    width: 26,
    height: 54,
  };
}

export function createStreetLamp(id: string, center: RoadPoint): RoadDecoration {
  return {
    id,
    type: 'streetLamp',
    x: center.x,
    y: center.y,
    width: 24,
    height: 64,
  };
}

export function createRoadSign(id: string, center: RoadPoint, label: string): RoadDecoration {
  return {
    id,
    type: 'roadSign',
    label,
    x: center.x,
    y: center.y,
    width: 94,
    height: 46,
  };
}
