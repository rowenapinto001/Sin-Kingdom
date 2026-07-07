import { WorldLocationId } from '../world/worldTypes';

export type MiniMapNode = {
  id: WorldLocationId;
  number: number;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  restricted?: boolean;
};

export const miniMapNodes: MiniMapNode[] = [
  { id: 'playerHouse', number: 1, label: 'PLAYER HOUSE', x: 112, y: 420 },
  { id: 'boatingDock', number: 2, label: 'BOATING', x: 92, y: 82 },
  { id: 'magicCity', number: 3, label: 'MAGIC CITY', x: 420, y: 76 },
  { id: 'partyPartyYeah', number: 4, label: 'PARTY', x: 722, y: 78 },
  { id: 'policeStation', number: 5, label: 'POLICE', x: 900, y: 126, restricted: true },
  { id: 'raniRajMahal', number: 6, label: 'MAHAL', x: 820, y: 360 },
  { id: 'friendsHouse', number: 7, label: 'FRIENDS', x: 610, y: 300, width: 70 },
  { id: 'pinkPalace', number: 8, label: 'PALACE', x: 858, y: 650 },
  { id: 'airport', number: 9, label: 'AIRPORT', x: 128, y: 790 },
  { id: 'clockTower', number: 10, label: 'CLOCK', x: 430, y: 640 },
  { id: 'desert', number: 11, label: 'DESERT', x: 650, y: 640 },
  { id: 'garage', number: 12, label: 'GARAGE', x: 430, y: 300 },
  { id: 'roseTemple', number: 13, label: 'TEMPLE', x: 430, y: 790 },
  { id: 'garden', number: 14, label: 'GARDEN', x: 650, y: 790 },
  { id: 'doorway', number: 15, label: 'DOORWAY', x: 858, y: 790 },
];

export const miniMapNodeById = miniMapNodes.reduce<Record<WorldLocationId, MiniMapNode>>((nodes, node) => {
  nodes[node.id] = node;
  return nodes;
}, {} as Record<WorldLocationId, MiniMapNode>);
