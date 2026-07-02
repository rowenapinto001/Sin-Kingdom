import { Rect } from './worldTypes';

export type GrassTileType = 'normal' | 'light' | 'dark' | 'flower' | 'trimmed' | 'luxury' | 'meadow' | 'wild' | 'clover' | 'royal';
export type GardenDecorationType = 'roundBush' | 'squareHedge' | 'coneTree' | 'spiralTopiary' | 'flowerBed' | 'smallPlant' | 'hedgeWall' | 'gardenPath';

export type GrassTile = Rect & {
  id: string;
  type: GrassTileType;
};

export type GardenDecoration = Rect & {
  id: string;
  type: GardenDecorationType;
  blocked?: boolean;
  rotate?: string;
};

export function createGrassField(id: string, x: number, y: number, width: number, height: number, type: GrassTileType = 'normal'): GrassTile {
  return { id, x, y, width, height, type };
}

export function createHedgeRow({
  id,
  x,
  y,
  count,
  horizontal = true,
  type = 'roundBush',
  gap = 12,
}: {
  id: string;
  x: number;
  y: number;
  count: number;
  horizontal?: boolean;
  type?: GardenDecorationType;
  gap?: number;
}): GardenDecoration[] {
  const size =
    type === 'hedgeWall'
      ? { width: horizontal ? 92 : 34, height: horizontal ? 34 : 92 }
      : type === 'flowerBed'
        ? { width: horizontal ? 58 : 44, height: horizontal ? 42 : 58 }
        : type === 'squareHedge'
          ? { width: 52, height: 46 }
          : type === 'coneTree' || type === 'spiralTopiary'
            ? { width: 56, height: 76 }
            : { width: 52, height: 48 };
  return Array.from({ length: count }, (_, index) => ({
    id: `${id}-${index}`,
    type,
    x: x + (horizontal ? index * (size.width + gap) : 0),
    y: y + (horizontal ? 0 : index * (size.height + gap)),
    width: size.width,
    height: size.height,
    blocked: type !== 'flowerBed' && type !== 'smallPlant',
  }));
}

export function createFlowerBorder(id: string, x: number, y: number, count: number, horizontal = true): GardenDecoration[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${id}-${index}`,
    type: 'flowerBed',
    x: x + (horizontal ? index * 54 : 0),
    y: y + (horizontal ? 0 : index * 48),
    width: horizontal ? 46 : 42,
    height: horizontal ? 34 : 44,
  }));
}

export function createGardenPath(id: string, x: number, y: number, width: number, height: number, rotate?: string): GardenDecoration {
  return { id, type: 'gardenPath', x, y, width, height, rotate };
}
