import { WorldObject } from '../world/worldTypes';

// Modest decorative/functional filler placed in the large gaps between major
// locations, so the expanded 12000x8000 world doesn't feel empty while
// travelling the roads/boats/planes between districts. Kept intentionally
// small (a few dozen objects) for render performance.
export const fillerDistrictObjects: WorldObject[] = [
  // Between Player House (5600,3600) and Magic City (3300,700): small shops,
  // apartments, and a park patch along the center vertical road.
  { id: 'filler-shop-1', label: 'Corner Shop', kind: 'building', x: 4550, y: 1650, width: 130, height: 100, color: '#3a3f4a' },
  { id: 'filler-shop-2', label: 'Grocery Store', kind: 'building', x: 4820, y: 2100, width: 150, height: 110, color: '#41465a' },
  { id: 'filler-apartment-1', label: 'Apartment Block', kind: 'building', x: 4400, y: 2500, width: 180, height: 160, color: '#3c4250' },
  { id: 'filler-apartment-2', label: 'Apartment Block', kind: 'building', x: 4950, y: 2850, width: 170, height: 150, color: '#3c4250' },
  { id: 'filler-park-1', label: 'Park Patch', kind: 'grass', x: 4650, y: 2250, width: 220, height: 160, color: '#2f6a3c' },
  { id: 'filler-lamp-1', label: 'Street Lamp', kind: 'decor', x: 4700, y: 1400, width: 16, height: 46, color: '#d7a92b' },
  { id: 'filler-lamp-2', label: 'Street Lamp', kind: 'decor', x: 4700, y: 3000, width: 16, height: 46, color: '#d7a92b' },

  // Between Player House and Garage (900,7000): gas station, parking lot, mechanic shop.
  { id: 'filler-gas-station', label: 'Gas Station', kind: 'building', x: 3200, y: 5200, width: 200, height: 140, color: '#4c3d2a' },
  { id: 'filler-parking-1', label: 'Parking Lot', kind: 'vehicle', x: 3450, y: 5400, width: 260, height: 100, color: '#2b2d34' },
  { id: 'filler-mechanic-shop', label: 'Mechanic Shop', kind: 'building', x: 2600, y: 6100, width: 190, height: 130, color: '#3d4048' },

  // Between Airport (700,5200) and central city: bus stop, parking zone, checkpoint.
  { id: 'filler-bus-stop', label: 'Bus Stop', kind: 'decor', x: 2300, y: 4600, width: 90, height: 50, color: '#8f8f8f' },
  { id: 'filler-parking-2', label: 'Parking Zone', kind: 'vehicle', x: 2450, y: 4750, width: 220, height: 100, color: '#2b2d34' },
  { id: 'filler-checkpoint', label: 'Checkpoint Booth', kind: 'building', x: 2700, y: 4550, width: 110, height: 90, color: '#454b3e' },

  // Between Pink Palace (9900,2800) and Desert (9300,5000): roadside shop, palm
  // trees, cactus patch, and a desert gate marking the sand transition.
  { id: 'filler-roadside-shop', label: 'Roadside Shop', kind: 'building', x: 9700, y: 3900, width: 150, height: 110, color: '#4a3a2e' },
  { id: 'filler-palm-cluster', label: 'Palm Trees', kind: 'decor', x: 9550, y: 4250, width: 160, height: 90, color: '#3f7d3a' },
  { id: 'filler-cactus-patch', label: 'Cactus Patch', kind: 'decor', x: 9800, y: 4550, width: 140, height: 80, color: '#4c7a3f' },
  { id: 'filler-desert-gate', label: 'Desert Gate', kind: 'decor', x: 9600, y: 4850, width: 120, height: 100, color: '#a3762f' },

  // Between Boating Dock (900,700) and Rani-Raj Mahal (1200,2700): dock/bridge
  // decor, benches, walking path.
  { id: 'filler-dock-bench-1', label: 'Bench', kind: 'decor', x: 1050, y: 1650, width: 50, height: 30, color: '#7a5a3a' },
  { id: 'filler-dock-bench-2', label: 'Bench', kind: 'decor', x: 1200, y: 2100, width: 50, height: 30, color: '#7a5a3a' },
  { id: 'filler-walk-path', label: 'Walking Path', kind: 'footpath', x: 1080, y: 1750, width: 90, height: 500, color: '#716a78' },

  // Between Police Station (8400,700) and Party Party Yeah (5800,700): small
  // office buildings and patrol-road decor.
  { id: 'filler-office-1', label: 'Office Building', kind: 'building', x: 6900, y: 850, width: 170, height: 150, color: '#39424c' },
  { id: 'filler-office-2', label: 'Office Building', kind: 'building', x: 7300, y: 1050, width: 160, height: 140, color: '#39424c' },
  { id: 'filler-patrol-decor', label: 'Patrol Marker', kind: 'decor', x: 7550, y: 900, width: 40, height: 40, color: '#ff3030' },

  // Between Clock Tower (7000,5200) and Garden (5700,6900): plaza decor, statues, lamp posts.
  { id: 'filler-plaza-statue-1', label: 'Plaza Statue', kind: 'decor', x: 6600, y: 6100, width: 60, height: 90, color: '#c9c2a3' },
  { id: 'filler-plaza-statue-2', label: 'Plaza Statue', kind: 'decor', x: 6800, y: 6350, width: 60, height: 90, color: '#c9c2a3' },
  { id: 'filler-plaza-lamp-1', label: 'Street Lamp', kind: 'decor', x: 6500, y: 5900, width: 16, height: 46, color: '#d7a92b' },
  { id: 'filler-plaza-lamp-2', label: 'Street Lamp', kind: 'decor', x: 6900, y: 6600, width: 16, height: 46, color: '#d7a92b' },
];
