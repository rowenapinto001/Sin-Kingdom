import { StyleSheet, Text, View } from 'react-native';
import { miniMapRoutes, miniMapTrafficLights, miniMapWaterZone } from '../data/miniMapRoutes';
import { miniMapNodes } from '../data/locationNodes';
import { PLAYER_WORLD_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from '../world/worldData';

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

const CANVAS_WIDTH = 155;
const CANVAS_HEIGHT = 118;
const DESIGN_WIDTH = 1000;
const DESIGN_HEIGHT = 900;
const SCALE_X = CANVAS_WIDTH / DESIGN_WIDTH;
const SCALE_Y = CANVAS_HEIGHT / DESIGN_HEIGHT;

function sx(value: number) {
  return value * SCALE_X;
}

function sy(value: number) {
  return value * SCALE_Y;
}

function designPointFromWorld(x: number, y: number) {
  return {
    left: sx((x / WORLD_WIDTH) * DESIGN_WIDTH),
    top: sy((y / WORLD_HEIGHT) * DESIGN_HEIGHT),
  };
}

function Segment({ from, to, bridge = false }: { from: { x: number; y: number }; to: { x: number; y: number }; bridge?: boolean }) {
  const dx = sx(to.x - from.x);
  const dy = sy(to.y - from.y);
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return (
    <View
      style={[
        styles.roadSegment,
        bridge && styles.bridgeSegment,
        {
          left: sx(from.x) + dx / 2 - length / 2,
          top: sy(from.y) + dy / 2 - 4,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    >
      <View style={styles.roadLineTop} />
      <View style={styles.roadLineBottom} />
    </View>
  );
}

function StarTrafficLight({ x, y, rotation = 0 }: { x: number; y: number; rotation?: number }) {
  return (
    <View style={[styles.trafficStar, { left: sx(x) - 4, top: sy(y) - 4, transform: [{ rotate: `${rotation}deg` }] }]}>
      <Text style={styles.trafficStarText}>★</Text>
    </View>
  );
}

export default function MiniMap({ player, boss, npcs, footsteps }: MiniMapProps) {
  const playerPoint = designPointFromWorld(player.x + PLAYER_WORLD_SIZE / 2, player.y + PLAYER_WORLD_SIZE / 2);
  const bossPoint = designPointFromWorld(boss.x + PLAYER_WORLD_SIZE / 2, boss.y + PLAYER_WORLD_SIZE / 2);
  const policeNpcs = npcs.filter((npc) => npc.role === 'police');
  const policeClose = policeNpcs.some((npc) => Math.hypot(npc.x - player.x, npc.y - player.y) < 780);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>SIN KINGDOM</Text>
        <Text style={styles.subtitle}>{policeClose ? 'POLICE BEHIND' : 'WORLD MAP'}</Text>
      </View>
      <View style={styles.canvas}>
        <View
          style={[
            styles.water,
            {
              left: sx(miniMapWaterZone.x),
              top: sy(miniMapWaterZone.y),
              width: sx(miniMapWaterZone.width),
              height: sy(miniMapWaterZone.height),
            },
          ]}
        >
          <View style={[styles.waterWave, { top: sy(34), left: sx(24), width: sx(250) }]} />
          <View style={[styles.waterWave, { top: sy(86), left: sx(54), width: sx(210) }]} />
          <View style={[styles.waterWave, { top: sy(142), left: sx(18), width: sx(238) }]} />
        </View>
        {miniMapRoutes.map((route) => route.points.slice(0, -1).map((point, index) => (
          <Segment key={`${route.id}-${index}`} from={point} to={route.points[index + 1]} bridge={route.kind === 'bridge'} />
        )))}
        {miniMapTrafficLights.map((light) => (
          <StarTrafficLight key={light.id} x={light.x} y={light.y} rotation={light.rotation} />
        ))}
        {miniMapNodes.map((node) => (
          <View
            key={node.id}
            style={[
              styles.node,
              node.restricted && styles.nodeRestricted,
              {
                left: sx(node.x) - sx(node.width ?? 48) / 2,
                top: sy(node.y) - sy(node.height ?? 42) / 2,
                width: sx(node.width ?? 48),
                height: sy(node.height ?? 42),
              },
            ]}
          >
            <Text style={styles.nodeText}>{node.number}</Text>
          </View>
        ))}
        {footsteps.slice(-18).map((step, index) => {
          const point = designPointFromWorld(step.x, step.y);
          return <View key={step.id} style={[styles.footstep, { left: point.left, top: point.top, opacity: 0.25 + index * 0.04 }]} />;
        })}
        <View style={[styles.bossMarker, { left: bossPoint.left - 2, top: bossPoint.top - 2 }]} />
        {policeNpcs.map((npc) => {
          const point = designPointFromWorld(npc.x + PLAYER_WORLD_SIZE / 2, npc.y + PLAYER_WORLD_SIZE / 2);
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
  water: {
    position: 'absolute',
    borderRadius: 7,
    backgroundColor: '#087fa5',
    borderWidth: 1.2,
    borderColor: '#6cf0ff',
    zIndex: 1,
    overflow: 'hidden',
  },
  waterWave: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(173,240,255,0.82)',
  },
  roadSegment: {
    position: 'absolute',
    height: 8,
    marginTop: -4,
    backgroundColor: '#161e1c',
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#d7a92b',
    zIndex: 3,
  },
  bridgeSegment: {
    backgroundColor: '#262b31',
    borderColor: '#f3d38a',
  },
  roadLineTop: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 1.4,
    height: 1,
    backgroundColor: '#f2cc55',
  },
  roadLineBottom: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 1.4,
    height: 1,
    backgroundColor: '#f2cc55',
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
  trafficStar: {
    position: 'absolute',
    zIndex: 6,
  },
  trafficStarText: {
    color: '#ff2e8a',
    fontSize: 9,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 4,
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
