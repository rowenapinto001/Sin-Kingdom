import { useEffect, useRef, useState } from 'react';
import { Direction, GameBounds, PlayerState } from './types';

const PLAYER_SIZE = 32;
const PLAYER_SPEED = 120;
const FRAME_DURATION_MS = 120;

const initialPlayer: PlayerState = {
  x: 120,
  y: 120,
  direction: 'down',
  isMoving: false,
  animationFrame: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getMovementVector(activeDirections: Direction[]) {
  let dx = 0;
  let dy = 0;

  if (activeDirections.includes('left')) dx -= 1;
  if (activeDirections.includes('right')) dx += 1;
  if (activeDirections.includes('up')) dy -= 1;
  if (activeDirections.includes('down')) dy += 1;

  return { dx, dy };
}

function getDirectionFromVector(dx: number, dy: number, currentDirection: Direction): Direction {
  if (dx === 0 && dy === 0) return currentDirection;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function useGameLoop(activeDirections: Direction[], bounds: GameBounds) {
  const [player, setPlayer] = useState<PlayerState>(initialPlayer);
  const playerRef = useRef<PlayerState>(initialPlayer);
  const activeDirectionsRef = useRef<Direction[]>(activeDirections);
  const boundsRef = useRef<GameBounds>(bounds);
  const animationAccumulatorRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const frameRequestRef = useRef<number | null>(null);
  const didPlaceInitialPlayerRef = useRef(false);

  useEffect(() => {
    activeDirectionsRef.current = activeDirections;
  }, [activeDirections]);

  useEffect(() => {
    boundsRef.current = bounds;
    if (bounds.width <= 0 || bounds.height <= 0) return;

    if (!didPlaceInitialPlayerRef.current) {
      didPlaceInitialPlayerRef.current = true;
      const centeredPlayer = {
        ...playerRef.current,
        x: Math.max(0, (bounds.width - PLAYER_SIZE) / 2),
        y: Math.max(0, (bounds.height - PLAYER_SIZE) / 2),
      };
      playerRef.current = centeredPlayer;
      setPlayer(centeredPlayer);
      return;
    }

    const maxX = Math.max(0, bounds.width - PLAYER_SIZE);
    const maxY = Math.max(0, bounds.height - PLAYER_SIZE);
    const clampedPlayer = {
      ...playerRef.current,
      x: clamp(playerRef.current.x, 0, maxX),
      y: clamp(playerRef.current.y, 0, maxY),
    };
    playerRef.current = clampedPlayer;
    setPlayer(clampedPlayer);
  }, [bounds.height, bounds.width]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      const deltaSeconds = Math.min(deltaMs / 1000, 0.05);
      lastTimestampRef.current = timestamp;

      const current = playerRef.current;
      const { dx, dy } = getMovementVector(activeDirectionsRef.current);
      const isMoving = dx !== 0 || dy !== 0;
      const direction = getDirectionFromVector(dx, dy, current.direction);

      let nextX = current.x;
      let nextY = current.y;

      if (isMoving) {
        const length = Math.hypot(dx, dy);
        const normalizedX = dx / length;
        const normalizedY = dy / length;
        nextX += normalizedX * PLAYER_SPEED * deltaSeconds;
        nextY += normalizedY * PLAYER_SPEED * deltaSeconds;
      }

      const maxX = Math.max(0, boundsRef.current.width - PLAYER_SIZE);
      const maxY = Math.max(0, boundsRef.current.height - PLAYER_SIZE);
      nextX = clamp(nextX, 0, maxX);
      nextY = clamp(nextY, 0, maxY);

      let animationFrame = current.animationFrame;

      if (isMoving) {
        animationAccumulatorRef.current += deltaMs;
        while (animationAccumulatorRef.current >= FRAME_DURATION_MS) {
          animationFrame = (animationFrame + 1) % 4;
          animationAccumulatorRef.current -= FRAME_DURATION_MS;
        }
      } else {
        animationAccumulatorRef.current = 0;
        animationFrame = 0;
      }

      const nextPlayer: PlayerState = {
        x: nextX,
        y: nextY,
        direction,
        isMoving,
        animationFrame,
      };

      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);
      frameRequestRef.current = requestAnimationFrame(tick);
    };

    frameRequestRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      lastTimestampRef.current = null;
    };
  }, []);

  return player;
}
