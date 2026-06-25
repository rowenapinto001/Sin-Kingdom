export type Direction = 'down' | 'left' | 'right' | 'up';

export type PlayerState = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  animationFrame: number;
};

export type GameBounds = {
  width: number;
  height: number;
};
