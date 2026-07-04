import { allLocationConfigs } from '../data/locationConfigs';
import { Rect } from './worldTypes';

export function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function isBlockedByLocation(rect: Rect) {
  return allLocationConfigs.some((location) => rectsOverlap(rect, location.collisionBox));
}
