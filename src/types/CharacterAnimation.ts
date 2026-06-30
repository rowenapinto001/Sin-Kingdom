import { ImageSourcePropType } from 'react-native';
import { Direction } from '../game/types';

export type CharacterAction = 'idle' | 'walk' | 'run' | 'shoot' | 'dance';

export type DirectionalAnimationKey =
  | 'idle_down'
  | 'idle_up'
  | 'idle_left'
  | 'idle_right'
  | 'walk_down'
  | 'walk_up'
  | 'walk_left'
  | 'walk_right'
  | 'run_down'
  | 'run_up'
  | 'run_left'
  | 'run_right'
  | 'shoot_down'
  | 'shoot_up'
  | 'shoot_left'
  | 'shoot_right';

export type DanceAnimationKey = 'dance_idle' | 'dance_loop';

export type AnimationKey = DirectionalAnimationKey | DanceAnimationKey;

export type AnimationDefinition = {
  row: number;
  frames: number[];
  frameDuration: number;
  loop: boolean;
};

export type SpriteSheetLayout = {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  frameCount: number;
  directionRows: Record<Direction, number>;
  idleFrames: Record<Direction, number>;
};

export type CharacterAnimationConfig = {
  id: string;
  name: string;
  role: 'player' | 'boss' | 'bodyguard' | 'police' | 'security' | 'civilian' | 'dancer' | 'friend' | 'reference';
  source: ImageSourcePropType;
  sheet: SpriteSheetLayout;
  speed: number;
  animationSpeedMs: number;
  scale: number;
  animations?: Partial<Record<AnimationKey, AnimationDefinition>>;
  fallbackScale?: number;
  anchor?: {
    x: number;
    y: number;
  };
  notes?: string;
  needsSpriteReplacement?: boolean;
};

export function animationKeyFor(action: CharacterAction, direction: Direction): AnimationKey {
  if (action === 'dance') return 'dance_loop';
  return `${action}_${direction}` as DirectionalAnimationKey;
}
