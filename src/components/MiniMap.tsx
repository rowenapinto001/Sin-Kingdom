import { StyleSheet, Text, View } from 'react-native';
import { worldRoadObjects } from '../data/worldRoads';
import { PLAYER_WORLD_SIZE, WORLD_HEIGHT, WORLD_WIDTH, worldLocations } from '../world/worldData';

type WorldActorPoint = {
  x: number;
  y: number;
};

type MiniMapNpc = WorldActorPoint & {
  id: string;
  role: string;
};

type FootstepPoint = {
  id: number;
  x: number;
  y: number;
};

type MiniMapProps = {
  player: WorldActorPoint;
  boss: WorldActorPoint;
  npcs: MiniMapNpc[];
  footsteps: FootstepPoint[];
};

// The minimap is fully data-driven from the real world geometry
// (worldLocations / worldRoadObjects in worldData.ts / worldRoads.ts),
// scaled linearly against WORLD_WIDTH/WORLD_HEIGHT - no hand-authored
// design-space coordinates.
const CANVAS_WIDTH = 155;
const CANVAS_HEIGHT = 118;
const SCALE_X = CANVAS_WIDTH / WORLD_WIDTH;
const SCALE_Y = CANVAS_HEIGHT / WORLD_HEIGHT;

function sx(value: number) {
  return value * SCALE_X;
}

function sy(value: number) {
  return value * SCALE_Y;
}

function worldPoint(x: number, y: number) {
  return {
    left: sx(x),
    top: sy(y),
  };
}

export default function MiniMap({ player, boss, npcs, footsteps }: MiniMapProps) {
  const playerPoint = worldPoint(player.x + PLAYER_WORLD_SIZE / 2, player.y + PLAYER_WORLD_SIZE / 2);
  const bossPoint = worldPoint(boss.x + PLAYER_WORLD_SIZE / 2, boss.y + PLAYER_WORLD_SIZE / 2);
  const policeNpcs = npcs.filter((npc) => npc.role === 'police');
  const policeClose = policeNpcs.some((npc) => Math.hypot(npc.x - player.x, npc.y - player.y) < 780);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>SIN KINGDOM</Text>
        <Text style={styles.subtitle}>{policeClose ? 'POLICE BEHIND' : 'WORLD MAP'}</Text>
      </View>
      <View style={styles.canvas}>
        {worldRoadObjects.map((object) => (
          <View
            key={object.id}
            style={[
              styles.mapObject,
              {
                left: sx(object.x),
                top: sy(object.y),
                width: Math.max(1, sx(object.width)),
                height: Math.max(1, sy(object.height)),
                transform: object.rotate ? [{ rotate: object.rotate }] : undefined,
              },
              object.kind === 'footpath' && styles.mapFootpath,
              object.kind === 'road' && styles.mapRoad,
              object.kind === 'bridge' && styles.mapBridge,
              object.kind === 'water' && styles.mapWater,
            ]}
          />
        ))}
        {worldLocations.map((location, index) => (
          <View
            key={location.id}
            style={[
              styles.node,
              location.restricted && styles.nodeRestricted,
              {
                left: sx(location.x),
                top: sy(location.y),
                width: Math.max(8, sx(location.width)),
                height: Math.max(7, sy(location.height)),
                borderColor: location.restricted ? '#ff3030' : location.accent,
              },
            ]}
          >
            <Text style={styles.nodeText}>{index + 1}</Text>
          </View>
        ))}
        {footsteps.slice(-18).map((step, index) => {
          const point = worldPoint(step.x, step.y);
          return <View key={step.id} style={[styles.footstep, { left: point.left, top: point.top, opacity: 0.25 + index * 0.04 }]} />;
        })}
        <View style={[styles.bossMarker, { left: bossPoint.left - 2, top: bossPoint.top - 2 }]} />
        {policeNpcs.map((npc) => {
          const point = worldPoint(npc.x + PLAYER_WORLD_SIZE / 2, npc.y + PLAYER_WORLD_SIZE / 2);
          return (
            <View key={npc.id} style={[styles.policeMarker, { left: point.left - 4, top: point.top - 4 }]}>
              <Text style={styles.policeText}>!</Text>
            </View>
          );
        })}
        <View style={[styles.playerMarker, { left: playerPoint.left - 5, top: playerPoint.top - 5 }]}>
          <View style={styles.playerDot} />
        </View>
        <View style={styles.compass}>
          <Text style={styles.compassText}>N</Text>
          <Text style={styles.compassMid}>+</Text>
        </View>
      </View>
      <View style={styles.legend}>
        <View style={[styles.legendDot, styles.youDot]} />
        <Text style={styles.legendText}>You</Text>
        <View style={[styles.legendDot, styles.policeDot]} />
        <Text style={styles.legendText}>Police</Text>
        <View style={[styles.legendDot, styles.stepDot]} />
        <Text style={styles.legendText}>Footsteps</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 168,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(3, 12, 9, 0.93)',
    borderWidth: 2,
    borderColor: '#ff2e8a',
    shadowColor: '#ff2e8a',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    color: '#ff4f9e',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textShadowColor: '#ff2e8a',
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#f8f3e8',
    fontSize: 6,
    fontWeight: '900',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: '#14391f',
    borderWidth: 1.2,
    borderColor: '#d7a92b',
  },
  mapObject: {
    position: 'absolute',
    borderRadius: 2,
  },
  mapRoad: {
    backgroundColor: '#242830',
    borderWidth: 0.5,
    borderColor: '#ffca4a',
  },
  mapBridge: {
    backgroundColor: '#30343d',
    borderWidth: 0.7,
    borderColor: '#d6c088',
  },
  mapFootpath: {
    backgroundColor: '#8b8077',
    opacity: 0.72,
  },
  mapWater: {
    backgroundColor: '#087fa5',
    borderRadius: 4,
    opacity: 0.92,
  },
  node: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: '#071018',
    borderWidth: 1.4,
    borderColor: '#f0c257',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  nodeRestricted: {
    borderColor: '#ff3030',
  },
  nodeText: {
    color: '#fff7db',
    fontSize: 6,
    fontWeight: '900',
  },
  footstep: {
    position: 'absolute',
    width: 2.3,
    height: 2.3,
    borderRadius: 2,
    backgroundColor: '#fff2bc',
    zIndex: 6,
  },
  playerMarker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8cff75',
    backgroundColor: 'rgba(35,255,100,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7,
  },
  playerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d9ff70',
  },
  bossMarker: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ffd86e',
    backgroundColor: '#7e4bff',
    zIndex: 7,
  },
  policeMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#ff3030',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7,
  },
  policeText: {
    color: '#fff',
    fontSize: 5,
    fontWeight: '900',
  },
  compass: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7e4d8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  compassText: {
    color: '#f7fff7',
    fontSize: 5,
    fontWeight: '900',
  },
  compassMid: {
    color: '#f7fff7',
    fontSize: 8,
    lineHeight: 8,
    fontWeight: '900',
  },
  legend: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  youDot: {
    backgroundColor: '#8cff75',
  },
  policeDot: {
    backgroundColor: '#ff3030',
  },
  stepDot: {
    backgroundColor: '#fff2bc',
  },
  legendText: {
    color: '#f8f3e8',
    fontSize: 6,
    fontWeight: '900',
  },
});
