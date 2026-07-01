import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import DPad from '../../components/DPad';
import InteractZone from '../../components/InteractZone';
import SpriteCharacter from '../../components/SpriteCharacter';
import { AirportDestination } from '../../data/airportDestinations';
import { Direction } from '../../game/types';
import { Rect, WorldLocationId } from '../worldTypes';
import AirplaneCabin from './AirplaneCabin';

export type AirportSceneState =
  | 'outside_airport'
  | 'inside_airport'
  | 'check_in'
  | 'choose_destination'
  | 'airplane_cabin'
  | 'flying'
  | 'landing'
  | 'parachuting';

type Actor = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
};

type AirportInteriorProps = {
  destinations: AirportDestination[];
  selectedDestinationId: WorldLocationId;
  caughtByPolice: boolean;
  onSelectDestination: (destinationId: WorldLocationId) => void;
  onStartFlight: (destinationId: WorldLocationId) => void;
  onExit: () => void;
};

const AIRPORT_WIDTH = 1180;
const AIRPORT_HEIGHT = 680;
const ACTOR_SIZE = 46;
const AIRPORT_SPEED = 190;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function movementVector(activeDirections: Direction[]) {
  let dx = 0;
  let dy = 0;
  if (activeDirections.includes('left')) dx -= 1;
  if (activeDirections.includes('right')) dx += 1;
  if (activeDirections.includes('up')) dy -= 1;
  if (activeDirections.includes('down')) dy += 1;
  const length = Math.hypot(dx, dy);
  return length > 0 ? { dx: dx / length, dy: dy / length } : { dx: 0, dy: 0 };
}

function directionFromVector(dx: number, dy: number, fallback: Direction): Direction {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

const exteriorBlocks: Rect[] = [
  { x: 60, y: 82, width: 748, height: 162 },
  { x: 822, y: 72, width: 284, height: 176 },
  { x: 836, y: 400, width: 262, height: 96 },
  { x: 52, y: 486, width: 482, height: 84 },
];

const interiorBlocks: Rect[] = [
  { x: 42, y: 48, width: 1088, height: 42 },
  { x: 84, y: 150, width: 280, height: 84 },
  { x: 444, y: 148, width: 252, height: 88 },
  { x: 784, y: 146, width: 250, height: 90 },
  { x: 94, y: 396, width: 300, height: 70 },
  { x: 546, y: 388, width: 254, height: 72 },
];

export default function AirportInterior({
  destinations,
  selectedDestinationId,
  caughtByPolice,
  onSelectDestination,
  onStartFlight,
  onExit,
}: AirportInteriorProps) {
  const { width, height } = useWindowDimensions();
  const [sceneState, setSceneState] = useState<AirportSceneState>('outside_airport');
  const [message, setMessage] = useState('Walk to the glowing Entry Door zone.');
  const [activeDirections, setActiveDirections] = useState<Direction[]>([]);
  const activeDirectionsRef = useRef<Direction[]>([]);
  const [player, setPlayer] = useState<Actor>({ x: 520, y: 574, direction: 'up', isMoving: false });
  const playerRef = useRef(player);
  const [boss, setBoss] = useState<Actor>({ x: 462, y: 596, direction: 'up', isMoving: false });
  const bossRef = useRef(boss);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const selectedDestination = destinations.find((destination) => destination.id === selectedDestinationId) ?? destinations[0];
  const scale = Math.min(width / AIRPORT_WIDTH, height / AIRPORT_HEIGHT);
  const stageLeft = (width - AIRPORT_WIDTH * scale) / 2;
  const stageTop = (height - AIRPORT_HEIGHT * scale) / 2;
  const isInside = sceneState !== 'outside_airport';
  const blocks = isInside ? interiorBlocks : exteriorBlocks;

  const zones = useMemo(
    () => [
      {
        id: 'entry',
        label: 'Enter Airport',
        rect: isInside ? { x: 506, y: 578, width: 150, height: 76 } : { x: 488, y: 238, width: 170, height: 74 },
        disabled: false,
      },
      {
        id: 'checkin',
        label: 'Check luggage',
        rect: { x: 116, y: 252, width: 208, height: 80 },
        disabled: sceneState === 'outside_airport',
      },
      {
        id: 'destination',
        label: 'Choose destination',
        rect: { x: 456, y: 252, width: 214, height: 80 },
        disabled: sceneState === 'outside_airport' || sceneState === 'inside_airport',
      },
      {
        id: 'pilot',
        label: 'Drive Aeroplane',
        rect: isInside ? { x: 840, y: 252, width: 202, height: 80 } : { x: 850, y: 314, width: 190, height: 78 },
        disabled: sceneState !== 'choose_destination',
      },
    ],
    [isInside, sceneState],
  );

  const nearZone = zones.find((zone) => rectsOverlap({ x: player.x, y: player.y, width: ACTOR_SIZE, height: ACTOR_SIZE }, zone.rect));

  useEffect(() => {
    activeDirectionsRef.current = activeDirections;
  }, [activeDirections]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const current = playerRef.current;
      const vector = movementVector(activeDirectionsRef.current);
      const direction = directionFromVector(vector.dx, vector.dy, current.direction);
      const candidate = {
        x: clamp(current.x + vector.dx * AIRPORT_SPEED * delta, 12, AIRPORT_WIDTH - ACTOR_SIZE - 12),
        y: clamp(current.y + vector.dy * AIRPORT_SPEED * delta, 90, AIRPORT_HEIGHT - ACTOR_SIZE - 12),
        width: ACTOR_SIZE,
        height: ACTOR_SIZE,
      };
      const moving = vector.dx !== 0 || vector.dy !== 0;
      const blocked = blocks.some((block) => rectsOverlap(candidate, block));
      const nextPlayer = moving && !blocked ? { x: candidate.x, y: candidate.y, direction, isMoving: true } : { ...current, direction, isMoving: false };
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

      const currentBoss = bossRef.current;
      const target = { x: nextPlayer.x - 54, y: nextPlayer.y + 44 };
      const dx = target.x - currentBoss.x;
      const dy = target.y - currentBoss.y;
      const distance = Math.hypot(dx, dy);
      const bossMoves = distance > 12;
      const step = bossMoves ? Math.min(distance, 134 * delta) / distance : 0;
      const nextBoss = bossMoves
        ? {
            x: currentBoss.x + dx * step,
            y: currentBoss.y + dy * step,
            direction: directionFromVector(dx, dy, currentBoss.direction),
            isMoving: true,
          }
        : { ...currentBoss, isMoving: false };
      bossRef.current = nextBoss;
      setBoss(nextBoss);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
  }, [blocks]);

  const pressDirection = (direction: Direction) => {
    setActiveDirections((current) => (current.includes(direction) ? current : [...current, direction]));
  };

  const releaseDirection = (direction: Direction) => {
    setActiveDirections((current) => current.filter((item) => item !== direction));
  };

  const enterInterior = () => {
    setSceneState('inside_airport');
    const nextPlayer = { x: 548, y: 578, direction: 'up' as Direction, isMoving: false };
    const nextBoss = { x: 492, y: 600, direction: 'up' as Direction, isMoving: false };
    playerRef.current = nextPlayer;
    bossRef.current = nextBoss;
    setPlayer(nextPlayer);
    setBoss(nextBoss);
    setMessage('Inside terminal. Walk to Check-in / Luggage.');
  };

  const interact = (zoneId = nearZone?.id) => {
    if (!zoneId) {
      setMessage('Walk into a glowing airport section to interact.');
      return;
    }
    if (zoneId === 'entry') {
      enterInterior();
      return;
    }
    if (zoneId === 'checkin') {
      if (sceneState === 'outside_airport') return;
      setSceneState('check_in');
      setMessage('Luggage checked. Passenger check-in complete.');
      return;
    }
    if (zoneId === 'destination') {
      if (sceneState === 'outside_airport' || sceneState === 'inside_airport') {
        setMessage('Check luggage first.');
        return;
      }
      setSceneState('choose_destination');
      setMessage('Choose destination from the airport board.');
      return;
    }
    if (zoneId === 'pilot') {
      if (sceneState !== 'choose_destination') {
        setMessage('Choose destination before driving the aeroplane.');
        return;
      }
      setSceneState('airplane_cabin');
    }
  };

  const selectDestination = (destinationId: WorldLocationId) => {
    const destination = destinations.find((item) => item.id === destinationId);
    if (!destination) return;
    if (destinationId === 'policeStation' && !caughtByPolice) {
      setMessage('Police Station is restricted.');
      return;
    }
    onSelectDestination(destinationId);
    setSceneState('choose_destination');
    setMessage(`Destination selected: ${destination.name}. Go to Pilot / Aeroplane Control.`);
  };

  const openCabin = () => {
    if (sceneState !== 'choose_destination') {
      setMessage('Enter airport, check luggage, and choose destination before driving.');
      return;
    }
    setSceneState('airplane_cabin');
  };

  if (sceneState === 'airplane_cabin') {
    return (
      <AirplaneCabin
        destination={selectedDestination}
        onStartFlight={() => onStartFlight(selectedDestination.id)}
        onBack={() => {
          setSceneState('choose_destination');
          setMessage('Back in terminal. Pilot door is ready.');
        }}
      />
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.title}>AEROPLANE / AIRPORT</Text>
        <Text style={styles.status}>{nearZone ? `${nearZone.label}: press INTERACT` : message}</Text>
      </View>

      <View style={[styles.stage, { width: AIRPORT_WIDTH, height: AIRPORT_HEIGHT, transform: [{ translateX: stageLeft }, { translateY: stageTop }, { scale }] }]}>
        {isInside ? <AirportInsideArt /> : <AirportExteriorArt />}

        {zones.map((zone) => (
          <InteractZone
            key={zone.id}
            x={zone.rect.x}
            y={zone.rect.y}
            width={zone.rect.width}
            height={zone.rect.height}
            label={zone.label}
            disabled={zone.disabled}
            active={nearZone?.id === zone.id}
            onPress={() => interact(zone.id)}
          />
        ))}

        <View style={[styles.actor, { transform: [{ translateX: boss.x }, { translateY: boss.y }] }]}>
          <SpriteCharacter characterId="victorKane" direction={boss.direction} isMoving={boss.isMoving} currentAction={boss.isMoving ? 'walk' : 'idle'} scale={1.6} />
        </View>
        <View style={[styles.actor, styles.playerActor, { transform: [{ translateX: player.x }, { translateY: player.y }] }]}>
          <SpriteCharacter characterId="lunaCrown" direction={player.direction} isMoving={player.isMoving} currentAction={player.isMoving ? 'walk' : 'idle'} scale={1.72} />
        </View>

        <AirportNpcs isInside={isInside} />
      </View>

      {sceneState === 'choose_destination' || sceneState === 'check_in' ? (
        <View style={styles.destinationPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Destination Board</Text>
            {sceneState === 'choose_destination' ? (
              <Pressable style={styles.driveNowButton} onPress={openCabin}>
                <Text style={styles.driveNowText}>DRIVE AEROPLANE</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.destinationGrid}>
            {destinations.map((destination) => {
              const locked = destination.id === 'policeStation' && !caughtByPolice;
              const selected = destination.id === selectedDestinationId;
              return (
                <Pressable
                  key={destination.id}
                  style={[styles.destinationButton, selected && styles.destinationButtonSelected, locked && styles.destinationButtonLocked]}
                  onPress={() => selectDestination(destination.id)}
                >
                  <Text style={[styles.destinationText, selected && styles.destinationTextSelected]}>
                    {locked ? 'Police Restricted' : destination.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => interact()}>
          <Text style={styles.primaryText}>INTERACT</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onExit}>
          <Text style={styles.secondaryText}>EXIT AIRPORT</Text>
        </Pressable>
      </View>

      <DPad activeDirections={activeDirections} onDirectionPressIn={pressDirection} onDirectionPressOut={releaseDirection} />
    </View>
  );
}

function AirportExteriorArt() {
  return (
    <View style={styles.artRoot}>
      <View style={styles.skyGlow} />
      <View style={styles.sunsetBand} />
      <View style={styles.farCityLine}>
        {Array.from({ length: 24 }).map((_, index) => (
          <View key={index} style={[styles.farTower, { height: 26 + ((index * 17) % 62) }]} />
        ))}
      </View>

      <View style={styles.terminalBackWing}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={index} style={styles.backWingWindow} />
        ))}
      </View>
      <View style={styles.terminalShadow} />
      <View style={styles.terminalSideWing}>
        <View style={styles.sideWingRoof} />
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={[styles.sideGlassPanel, { left: 18 + index * 42 }]} />
        ))}
      </View>
      <View style={styles.terminal}>
        <View style={styles.terminalDepthFace} />
        <View style={styles.terminalRoof} />
        <View style={styles.terminalRoofLip} />
        <View style={styles.glassWall}>
          {Array.from({ length: 12 }).map((_, index) => (
            <View key={index} style={[styles.glassBay, index % 2 === 0 && styles.glassBayLit]}>
              <View style={styles.glassRib} />
            </View>
          ))}
        </View>
        <View style={styles.departureLevel}>
          {Array.from({ length: 10 }).map((_, index) => (
            <View key={index} style={styles.departureDoor} />
          ))}
        </View>
        <Text style={styles.terminalSign}>SIN KINGDOM AIRPORT</Text>
      </View>

      <View style={styles.arrivalCanopy}>
        <View style={styles.canopyTop} />
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={[styles.canopyPillar, { left: 20 + index * 26 }]} />
        ))}
      </View>
      <View style={styles.entryPath} />
      <View style={styles.dropOffLoop}>
        <View style={styles.dropOffIsland} />
      </View>
      <View style={styles.parking}>
        {Array.from({ length: 22 }).map((_, index) => (
          <View key={index} style={[styles.parkedCar, index % 3 === 0 && styles.parkedCarPink, index % 4 === 0 && styles.parkedCarGold]} />
        ))}
      </View>
      <View style={styles.frontRoad}>
        <View style={styles.roadLine} />
        <View style={[styles.movingCar, { left: 148 }]} />
        <View style={[styles.movingCar, styles.movingCarBlue, { left: 710 }]} />
      </View>

      <View style={styles.controlTower}>
        <View style={styles.towerCab}>
          <View style={styles.towerGlass} />
        </View>
        <View style={styles.towerBody} />
        <Text style={styles.towerText}>ATC</Text>
      </View>
      <View style={styles.radarTower}>
        <View style={styles.radarPole} />
        <View style={styles.radarDish}>
          <View style={styles.radarSweep} />
        </View>
        <View style={styles.radarRing} />
        <Text style={styles.radarText}>RADAR</Text>
      </View>

      <View style={styles.hangar}>
        <Text style={styles.smallSign}>HANGAR</Text>
      </View>
      <View style={styles.runway}>
        {Array.from({ length: 14 }).map((_, index) => (
          <View key={index} style={styles.runwayLight} />
        ))}
      </View>
      <View style={styles.parkedPlane}>
        <View style={styles.planeBody} />
        <View style={styles.planeWingA} />
        <View style={styles.planeWingB} />
        <View style={styles.planeTail} />
      </View>
      <View style={styles.lightPoleA} />
      <View style={styles.lightPoleB} />
      <View style={styles.lightGlowA} />
      <View style={styles.lightGlowB} />
    </View>
  );
}

function AirportInsideArt() {
  return (
    <View style={styles.artRootInside}>
      <View style={styles.floorShine} />
      <View style={styles.topWall}>
        <Text style={styles.terminalSign}>DEPARTURES</Text>
      </View>
      <View style={styles.counterA}>
        <Text style={styles.counterText}>CHECK-IN</Text>
      </View>
      <View style={styles.counterB}>
        <Text style={styles.counterText}>DESTINATIONS</Text>
      </View>
      <View style={styles.counterC}>
        <Text style={styles.counterText}>PILOT</Text>
      </View>
      <View style={styles.luggageBelt}>
        <View style={styles.luggageOne} />
        <View style={styles.luggageTwo} />
      </View>
      <View style={styles.seatingArea}>
        {Array.from({ length: 10 }).map((_, index) => (
          <View key={index} style={styles.seatDot} />
        ))}
      </View>
      <View style={styles.boardingGate}>
        <Text style={styles.smallSign}>GATE A</Text>
      </View>
    </View>
  );
}

function AirportNpcs({ isInside }: { isInside: boolean }) {
  const npcs = isInside
    ? [
        { id: 'staff-a', characterId: 'securityGuard1', x: 160, y: 338, label: 'Staff' },
        { id: 'staff-b', characterId: 'securityGuard2', x: 820, y: 342, label: 'Pilot' },
        { id: 'passenger-a', characterId: 'friend', x: 350, y: 500, label: 'Passenger' },
      ]
    : [
        { id: 'passenger-b', characterId: 'friend', x: 360, y: 392, label: 'Passenger' },
        { id: 'guard-a', characterId: 'securityGuard1', x: 704, y: 288, label: 'Security' },
        { id: 'passenger-c', characterId: 'npcWoman', x: 248, y: 420, label: 'Traveler' },
      ];

  return (
    <>
      {npcs.map((npc, index) => (
        <View key={npc.id} style={[styles.npc, { transform: [{ translateX: npc.x + (index % 2) * 10 }, { translateY: npc.y }] }]}>
          <SpriteCharacter characterId={npc.characterId} direction={index % 2 === 0 ? 'right' : 'left'} isMoving currentAction="walk" scale={1.25} />
          <Text style={styles.npcLabel}>{npc.label}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080b12',
    overflow: 'hidden',
  },
  hud: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 30,
    maxWidth: 520,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 4, 14, 0.84)',
    borderWidth: 2,
    borderColor: '#ffbd28',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  status: {
    marginTop: 4,
    color: '#fbe6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  stage: {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'top left',
  },
  artRoot: {
    flex: 1,
    backgroundColor: '#14234b',
  },
  artRootInside: {
    flex: 1,
    backgroundColor: '#151423',
  },
  skyGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 252,
    backgroundColor: '#f29a77',
  },
  sunsetBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 132,
    height: 180,
    backgroundColor: 'rgba(101, 65, 139, 0.62)',
  },
  farCityLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 178,
    height: 94,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    opacity: 0.5,
  },
  farTower: {
    width: 28,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: '#211c48',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 40, 0.28)',
  },
  terminalBackWing: {
    position: 'absolute',
    left: 122,
    top: 96,
    width: 660,
    height: 126,
    borderRadius: 18,
    backgroundColor: '#384d6b',
    borderWidth: 2,
    borderColor: '#9ab7ce',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 22,
    opacity: 0.95,
  },
  backWingWindow: {
    width: 56,
    height: 66,
    borderRadius: 12,
    backgroundColor: 'rgba(142, 232, 255, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  terminalShadow: {
    position: 'absolute',
    left: 48,
    top: 112,
    width: 784,
    height: 176,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.38)',
    transform: [{ translateY: 24 }],
  },
  terminalSideWing: {
    position: 'absolute',
    left: 618,
    top: 112,
    width: 222,
    height: 126,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 24,
    backgroundColor: '#526884',
    borderWidth: 2,
    borderColor: '#bfd4e6',
    transform: [{ skewY: '-4deg' }],
  },
  sideWingRoof: {
    position: 'absolute',
    left: -12,
    right: -8,
    top: -18,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#d7dbe2',
    borderWidth: 2,
    borderColor: '#fff0a6',
  },
  sideGlassPanel: {
    position: 'absolute',
    top: 34,
    width: 30,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(109, 211, 255, 0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.68)',
  },
  terminal: {
    position: 'absolute',
    left: 60,
    top: 82,
    width: 748,
    height: 162,
    borderRadius: 30,
    backgroundColor: '#657a92',
    borderWidth: 3,
    borderColor: '#f2d6a2',
    overflow: 'hidden',
  },
  terminalDepthFace: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    backgroundColor: '#384151',
  },
  terminalRoof: {
    height: 42,
    backgroundColor: '#cfd7df',
    borderBottomWidth: 2,
    borderColor: '#fff0a6',
  },
  terminalRoofLip: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: 28,
    height: 22,
    borderRadius: 18,
    backgroundColor: '#f0b95d',
    borderWidth: 1,
    borderColor: '#fff0a6',
  },
  glassWall: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 42,
    backgroundColor: 'rgba(36, 67, 92, 0.88)',
  },
  glassBay: {
    width: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(105, 209, 255, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
  },
  glassBayLit: {
    backgroundColor: 'rgba(255, 190, 96, 0.48)',
  },
  glassRib: {
    alignSelf: 'center',
    width: 6,
    height: '110%',
    backgroundColor: 'rgba(255,255,255,0.76)',
    transform: [{ skewX: '-14deg' }],
  },
  departureLevel: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 12,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  departureDoor: {
    width: 44,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#101827',
    borderWidth: 1,
    borderColor: '#8ee8ff',
  },
  terminalSign: {
    position: 'absolute',
    left: 20,
    top: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 6,
  },
  arrivalCanopy: {
    position: 'absolute',
    left: 484,
    top: 228,
    width: 170,
    height: 74,
    zIndex: 2,
  },
  canopyTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 26,
    borderRadius: 14,
    backgroundColor: '#f0b12e',
    borderWidth: 2,
    borderColor: '#fff0a6',
  },
  canopyPillar: {
    position: 'absolute',
    top: 24,
    width: 8,
    height: 50,
    backgroundColor: '#d5e4ef',
    borderRadius: 4,
  },
  entryPath: {
    position: 'absolute',
    left: 500,
    top: 218,
    width: 146,
    height: 270,
    borderRadius: 18,
    backgroundColor: '#596171',
    borderWidth: 2,
    borderColor: '#bfc7d6',
  },
  dropOffLoop: {
    position: 'absolute',
    left: 340,
    top: 304,
    width: 450,
    height: 154,
    borderRadius: 86,
    borderWidth: 22,
    borderColor: '#222833',
    backgroundColor: 'transparent',
  },
  dropOffIsland: {
    position: 'absolute',
    left: 138,
    top: 38,
    width: 136,
    height: 52,
    borderRadius: 28,
    backgroundColor: '#2c6c58',
    borderWidth: 2,
    borderColor: '#72d69e',
  },
  parking: {
    position: 'absolute',
    left: 52,
    top: 486,
    width: 482,
    height: 84,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
    backgroundColor: '#202632',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3d4658',
  },
  parkedCar: {
    width: 48,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8ee8ff',
  },
  parkedCarPink: {
    backgroundColor: '#ff2e8a',
  },
  parkedCarGold: {
    backgroundColor: '#ffbd28',
  },
  frontRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    backgroundColor: '#171c26',
    borderTopWidth: 4,
    borderColor: '#343d4d',
  },
  roadLine: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 44,
    height: 4,
    backgroundColor: '#fff0a6',
  },
  movingCar: {
    position: 'absolute',
    top: 18,
    width: 58,
    height: 22,
    borderRadius: 10,
    backgroundColor: '#ffbd28',
    borderWidth: 2,
    borderColor: '#fff0a6',
  },
  movingCarBlue: {
    backgroundColor: '#8ee8ff',
    top: 56,
  },
  controlTower: {
    position: 'absolute',
    left: 870,
    top: 52,
    width: 82,
    height: 214,
    alignItems: 'center',
  },
  towerCab: {
    width: 82,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1d3147',
    borderWidth: 3,
    borderColor: '#ffbd28',
    overflow: 'hidden',
  },
  towerGlass: {
    flex: 1,
    backgroundColor: 'rgba(142, 232, 255, 0.58)',
    borderBottomWidth: 8,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  towerBody: {
    width: 42,
    height: 156,
    backgroundColor: '#53667b',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#d5e4ef',
  },
  towerText: {
    position: 'absolute',
    top: 16,
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  radarTower: {
    position: 'absolute',
    right: 46,
    top: 128,
    width: 140,
    height: 190,
    alignItems: 'center',
  },
  radarPole: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 120,
    borderRadius: 6,
    backgroundColor: '#d5e4ef',
  },
  radarDish: {
    position: 'absolute',
    top: 22,
    width: 96,
    height: 42,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#0f2235',
    borderWidth: 3,
    borderColor: '#8ee8ff',
    overflow: 'hidden',
  },
  radarSweep: {
    position: 'absolute',
    left: 45,
    top: -20,
    width: 5,
    height: 86,
    backgroundColor: '#ffbd28',
    transform: [{ rotate: '58deg' }],
  },
  radarRing: {
    position: 'absolute',
    top: 0,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(142, 232, 255, 0.38)',
  },
  radarText: {
    position: 'absolute',
    bottom: 24,
    color: '#8ee8ff',
    fontSize: 10,
    fontWeight: '900',
  },
  hangar: {
    position: 'absolute',
    left: 822,
    top: 72,
    width: 284,
    height: 176,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    backgroundColor: '#334157',
    borderWidth: 3,
    borderColor: '#9db6cc',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  runway: {
    position: 'absolute',
    left: 662,
    top: 530,
    width: 468,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#202531',
    borderWidth: 3,
    borderColor: '#384252',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  runwayLight: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff0a6',
  },
  parkedPlane: {
    position: 'absolute',
    left: 836,
    top: 400,
    width: 262,
    height: 96,
  },
  planeBody: {
    position: 'absolute',
    left: 20,
    top: 36,
    width: 210,
    height: 26,
    borderRadius: 20,
    backgroundColor: '#eaf7ff',
    borderWidth: 2,
    borderColor: '#8ee8ff',
  },
  planeWingA: {
    position: 'absolute',
    left: 92,
    top: 6,
    width: 58,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#ffbd28',
    transform: [{ rotate: '-18deg' }],
  },
  planeWingB: {
    position: 'absolute',
    left: 92,
    top: 44,
    width: 58,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#ff2e8a',
    transform: [{ rotate: '18deg' }],
  },
  planeTail: {
    position: 'absolute',
    left: 12,
    top: 16,
    width: 34,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#8ee8ff',
  },
  lightPoleA: {
    position: 'absolute',
    left: 78,
    top: 250,
    width: 8,
    height: 118,
    backgroundColor: '#f7e7ba',
  },
  lightPoleB: {
    position: 'absolute',
    left: 732,
    top: 245,
    width: 8,
    height: 118,
    backgroundColor: '#f7e7ba',
  },
  lightGlowA: {
    position: 'absolute',
    left: 54,
    top: 246,
    width: 58,
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 240, 166, 0.32)',
  },
  lightGlowB: {
    position: 'absolute',
    left: 708,
    top: 241,
    width: 58,
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 240, 166, 0.32)',
  },
  smallSign: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  floorShine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 90,
    backgroundColor: '#272439',
  },
  topWall: {
    position: 'absolute',
    left: 42,
    top: 48,
    width: 1088,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#101427',
    borderWidth: 2,
    borderColor: '#8ee8ff',
  },
  counterA: {
    position: 'absolute',
    left: 84,
    top: 150,
    width: 280,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#25384b',
    borderWidth: 2,
    borderColor: '#8ee8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterB: {
    position: 'absolute',
    left: 444,
    top: 148,
    width: 252,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#371b42',
    borderWidth: 2,
    borderColor: '#ff2e8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterC: {
    position: 'absolute',
    left: 784,
    top: 146,
    width: 250,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#4b3514',
    borderWidth: 2,
    borderColor: '#ffbd28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  luggageBelt: {
    position: 'absolute',
    left: 94,
    top: 396,
    width: 300,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#111620',
    borderWidth: 3,
    borderColor: '#596578',
  },
  luggageOne: {
    position: 'absolute',
    left: 60,
    top: 18,
    width: 34,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ffbd28',
  },
  luggageTwo: {
    position: 'absolute',
    left: 164,
    top: 20,
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#ff2e8a',
  },
  seatingArea: {
    position: 'absolute',
    left: 546,
    top: 388,
    width: 254,
    height: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#151b2f',
    borderWidth: 2,
    borderColor: '#8ee8ff',
  },
  seatDot: {
    width: 32,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#596578',
  },
  boardingGate: {
    position: 'absolute',
    left: 890,
    top: 390,
    width: 160,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#121827',
    borderWidth: 2,
    borderColor: '#ffbd28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actor: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  playerActor: {
    zIndex: 20,
  },
  npc: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  npcLabel: {
    marginTop: -2,
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 3,
  },
  destinationPanel: {
    position: 'absolute',
    left: 16,
    right: 370,
    bottom: 14,
    zIndex: 40,
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(5, 2, 10, 0.86)',
  },
  panelTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  driveNowButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffbd28',
    borderWidth: 2,
    borderColor: '#fff0a6',
  },
  driveNowText: {
    color: '#120600',
    fontSize: 10,
    fontWeight: '900',
  },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  destinationButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(18, 14, 32, 0.92)',
  },
  destinationButtonSelected: {
    borderColor: '#fff0a6',
    backgroundColor: '#ffbd28',
  },
  destinationButtonLocked: {
    opacity: 0.5,
  },
  destinationText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  destinationTextSelected: {
    color: '#120600',
  },
  actions: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    zIndex: 45,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: '#ffbd28',
    borderWidth: 2,
    borderColor: '#fff0a6',
  },
  primaryText: {
    color: '#130805',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: 'rgba(12, 12, 18, 0.82)',
    borderWidth: 1,
    borderColor: '#ff2e8a',
  },
  secondaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
});
