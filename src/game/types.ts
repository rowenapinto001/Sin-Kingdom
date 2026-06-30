export type Direction = 'down' | 'left' | 'right' | 'up';

export type CharacterId = string;

export type PlayerState = {
  characterId: CharacterId;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  animationFrame: number;
};

export type CharacterRuntimeState = PlayerState;

export type GameBounds = {
  width: number;
  height: number;
};
