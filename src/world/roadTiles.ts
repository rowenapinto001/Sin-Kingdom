import { Rect } from './worldTypes';

export type RoadPoint = {
  x: number;
  y: number;
};

export type RoadDecorationType = 'trafficLight' | 'streetLamp' | 'roadSign' | 'crosswalk';

export type RoadDecoration = Rect & {
  id: string;
  type: RoadDecorationType;
  label?: string;
};

export const ROAD_WIDTH = 86;
export const SIDEWALK_WIDTH = 22;
export const CROSSWALK_SIZE = 82;
