import { ImageStyle } from 'react-native';
import { Direction } from '../game/types';
import { AnimationDefinition, AnimationKey, CharacterAnimationConfig, SpriteSheetLayout } from '../types/CharacterAnimation';

export type { AnimationDefinition, AnimationKey, CharacterAction, CharacterAnimationConfig, SpriteSheetLayout } from '../types/CharacterAnimation';

export const directionToRow = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
} as const satisfies Record<Direction, number>;

export function createFourDirectionSheet({
  frameWidth,
  frameHeight,
  columns = 4,
  rows = 4,
  idleFrame = 0,
}: {
  frameWidth: number;
  frameHeight: number;
  columns?: number;
  rows?: number;
  idleFrame?: number;
}): SpriteSheetLayout {
  return {
    frameWidth,
    frameHeight,
    columns,
    rows,
    frameCount: columns,
    directionRows: directionToRow,
    idleFrames: {
      down: idleFrame,
      left: idleFrame,
      right: idleFrame,
      up: idleFrame,
    },
  };
}

export function createStandardAnimations({
  frameDuration = 120,
  runFrameDuration = 85,
  shootFrameDuration = 110,
  danceFrameDuration = 140,
}: {
  frameDuration?: number;
  runFrameDuration?: number;
  shootFrameDuration?: number;
  danceFrameDuration?: number;
} = {}): Record<AnimationKey, AnimationDefinition> {
  const walkFrames = [0, 1, 2, 3];
  const idleFrames = [0];
  const shootFrames = [1, 2, 3];

  return {
    idle_down: { row: 0, frames: idleFrames, frameDuration, loop: true },
    idle_left: { row: 1, frames: idleFrames, frameDuration, loop: true },
    idle_right: { row: 2, frames: idleFrames, frameDuration, loop: true },
    idle_up: { row: 3, frames: idleFrames, frameDuration, loop: true },
    walk_down: { row: 0, frames: walkFrames, frameDuration, loop: true },
    walk_left: { row: 1, frames: walkFrames, frameDuration, loop: true },
    walk_right: { row: 2, frames: walkFrames, frameDuration, loop: true },
    walk_up: { row: 3, frames: walkFrames, frameDuration, loop: true },
    run_down: { row: 0, frames: walkFrames, frameDuration: runFrameDuration, loop: true },
    run_left: { row: 1, frames: walkFrames, frameDuration: runFrameDuration, loop: true },
    run_right: { row: 2, frames: walkFrames, frameDuration: runFrameDuration, loop: true },
    run_up: { row: 3, frames: walkFrames, frameDuration: runFrameDuration, loop: true },
    shoot_down: { row: 0, frames: shootFrames, frameDuration: shootFrameDuration, loop: false },
    shoot_left: { row: 1, frames: shootFrames, frameDuration: shootFrameDuration, loop: false },
    shoot_right: { row: 2, frames: shootFrames, frameDuration: shootFrameDuration, loop: false },
    shoot_up: { row: 3, frames: shootFrames, frameDuration: shootFrameDuration, loop: false },
    dance_idle: { row: 0, frames: idleFrames, frameDuration: danceFrameDuration, loop: true },
    dance_loop: { row: 0, frames: walkFrames, frameDuration: danceFrameDuration, loop: true },
  };
}

export function getDefaultAnimationForDirection(direction: Direction): AnimationDefinition {
  return { row: directionToRow[direction], frames: [0, 1, 2, 3], frameDuration: 120, loop: true };
}

export function createReferenceSheet({ width, height }: { width: number; height: number }): SpriteSheetLayout {
  return {
    frameWidth: width,
    frameHeight: height,
    columns: 1,
    rows: 1,
    frameCount: 1,
    directionRows: {
      down: 0,
      left: 0,
      right: 0,
      up: 0,
    },
    idleFrames: {
      down: 0,
      left: 0,
      right: 0,
      up: 0,
    },
  };
}

export function getSpriteSheetOffset({
  direction,
  frame,
  sheet,
}: {
  direction: Direction;
  frame: number;
  sheet: SpriteSheetLayout;
}) {
  const row = sheet.directionRows[direction] ?? 0;
  const safeFrame = sheet.frameCount > 0 ? frame % sheet.frameCount : 0;

  return {
    left: -safeFrame * sheet.frameWidth,
    top: -row * sheet.frameHeight,
  };
}

export function getSpriteImageStyle({
  frame,
  direction,
  sheet,
}: {
  frame: number;
  direction: Direction;
  sheet: SpriteSheetLayout;
}): ImageStyle {
  const offset = getSpriteSheetOffset({ direction, frame, sheet });

  return {
    width: sheet.columns * sheet.frameWidth,
    height: sheet.rows * sheet.frameHeight,
    position: 'absolute',
    left: offset.left,
    top: offset.top,
  };
}
