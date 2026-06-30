import { useEffect, useRef, useState } from 'react';
import { Direction } from '../game/types';
import { animationKeyFor, CharacterAction, CharacterAnimationConfig } from '../types/CharacterAnimation';
import { createStandardAnimations } from '../utils/spriteSheet';

type UseCharacterAnimationOptions = {
  config: CharacterAnimationConfig;
  direction: Direction;
  isMoving: boolean;
  action?: CharacterAction;
  frameOverride?: number;
};

export function useCharacterAnimation({ config, direction, isMoving, action, frameOverride }: UseCharacterAnimationOptions) {
  const resolvedAction: CharacterAction = action ?? (isMoving ? 'walk' : 'idle');
  const animations = config.animations ?? createStandardAnimations({ frameDuration: config.animationSpeedMs });
  const animationKey = animationKeyFor(resolvedAction, direction);
  const animation =
    animations[animationKey] ??
    animations[animationKeyFor(isMoving ? 'walk' : 'idle', direction)] ??
    animations.idle_down ?? {
      row: config.sheet.directionRows[direction] ?? 0,
      frames: [config.sheet.idleFrames[direction] ?? 0],
      frameDuration: config.animationSpeedMs,
      loop: true,
    };
  const [frameIndex, setFrameIndex] = useState(0);
  const frameIndexRef = useRef(0);
  const lastDirectionRef = useRef<Direction>(direction);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    lastDirectionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (typeof frameOverride === 'number') {
      const safeFrame = animation.frames.length > 0 ? frameOverride % animation.frames.length : 0;
      frameIndexRef.current = safeFrame;
      setFrameIndex(safeFrame);
    }
  }, [animation.frames.length, frameOverride]);

  useEffect(() => {
    if (typeof frameOverride === 'number') return undefined;

    frameIndexRef.current = 0;
    setFrameIndex(0);

    if (animation.frames.length <= 1) {
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      const nextFrame = animation.loop ? (frameIndexRef.current + 1) % animation.frames.length : Math.min(frameIndexRef.current + 1, animation.frames.length - 1);
      frameIndexRef.current = nextFrame;
      setFrameIndex(nextFrame);
    }, animation.frameDuration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [animation.frameDuration, animation.frames.length, animation.loop, animationKey, frameOverride]);

  const frame = animation.frames[frameIndex] ?? animation.frames[0] ?? 0;

  return {
    frame,
    row: animation.row,
    direction: lastDirectionRef.current,
    isMoving,
    action: resolvedAction,
  };
}
