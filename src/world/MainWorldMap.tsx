import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import DPad from '../components/DPad';
import SpriteCharacter from '../components/SpriteCharacter';
import { airportDestinations } from '../data/airportDestinations';
import { allLocationConfigs, getLocationConfig } from '../data/locationConfigs';
import { Direction } from '../game/types';
import { CharacterAction } from '../types/CharacterAnimation';
import LocationTile from './locations/LocationTile';
import {
  PLAYER_HOUSE_SPAWN,
  PLAYER_WORLD_SIZE,
  PLAYER_WORLD_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  worldLocations,
  worldNpcs,
  worldObjects,
} from './worldData';
import { Rect, WorldLocation, WorldLocationId, WorldNpc } from './worldTypes';
import AirplaneFlight from './locations/AirplaneFlight';
import AirportInterior from './locations/AirportInterior';

type NpcRuntime = WorldNpc & {
  targetIndex: number;
  isMoving: boolean;
};

type WorldActor = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
};

type MainWorldMapProps = {
  onStartMission: () => void;
  onBackToHideout: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function centerOf(rect: Rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

function directionFromVector(dx: number, dy: number, fallback: Direction): Direction {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
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

function nearestLocation(actor: WorldActor) {
  const actorCenter = { x: actor.x + PLAYER_WORLD_SIZE / 2, y: actor.y + PLAYER_WORLD_SIZE / 2 };
  const locationConfig = allLocationConfigs.find((location) =>
    rectsOverlap({ x: actorCenter.x - 4, y: actorCenter.y - 4, width: 8, height: 8 }, location.interactionZone),
  );
  return locationConfig ? worldLocations.find((location) => location.id === locationConfig.id) : undefined;
}

function isBlocked(next: Rect, caughtByPolice: boolean) {
  if (next.x < 0 || next.y < 0 || next.x + next.width > WORLD_WIDTH || next.y + next.height > WORLD_HEIGHT) return true;
  if (worldObjects.some((object) => object.blocked && rectsOverlap(next, object))) return true;
  return allLocationConfigs.some((location) => {
    if (location.id === 'policeStation' && caughtByPolice) return false;
    return rectsOverlap(next, location.collisionBox);
  });
}

export default function MainWorldMap({ onStartMission, onBackToHideout }: MainWorldMapProps) {
  const { width, height } = useWindowDimensions();
  const [activeDirections, setActiveDirections] = useState<Direction[]>([]);
  const activeDirectionsRef = useRef<Direction[]>([]);
  const [isFlying, setIsFlying] = useState(false);
  const [flightDestinationId, setFlightDestinationId] = useState<WorldLocationId>('playerHouse');
  const [caughtByPolice, setCaughtByPolice] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playerAction, setPlayerAction] = useState<CharacterAction>('idle');
  const shootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [player, setPlayer] = useState<WorldActor>({
    x: PLAYER_HOUSE_SPAWN.x,
    y: PLAYER_HOUSE_SPAWN.y,
    direction: 'down',
    isMoving: false,
  });
  const playerRef = useRef(player);
  const [boss, setBoss] = useState<WorldActor>({
    x: PLAYER_HOUSE_SPAWN.x - 62,
    y: PLAYER_HOUSE_SPAWN.y + 52,
    direction: 'down',
    isMoving: false,
  });
  const bossRef = useRef(boss);
  const [npcs, setNpcs] = useState<NpcRuntime[]>(worldNpcs.map((npc) => ({ ...npc, targetIndex: 1, isMoving: true })));
  const npcsRef = useRef(npcs);
  const [insideLocation, setInsideLocation] = useState<WorldLocation | null>(null);
  const [message, setMessage] = useState('Start at Player House. Roads connect every major place outward from the center.');
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const nearbyLocation = useMemo(() => nearestLocation(player), [player]);
  const cameraX = clamp(width / 2 - player.x, width - WORLD_WIDTH, 0);
  const cameraY = clamp(height / 2 - player.y, height - WORLD_HEIGHT, 0);

  useEffect(() => {
    activeDirectionsRef.current = activeDirections;
  }, [activeDirections]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaSeconds = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
      lastTimestampRef.current = timestamp;

      const current = playerRef.current;
      const vector = movementVector(activeDirectionsRef.current);
      const isMoving = vector.dx !== 0 || vector.dy !== 0;
      const direction = directionFromVector(vector.dx, vector.dy, current.direction);
      const movementSpeed = PLAYER_WORLD_SPEED * (isRunning ? 1.55 : 1);
      const candidate = {
        x: current.x + vector.dx * movementSpeed * deltaSeconds,
        y: current.y + vector.dy * movementSpeed * deltaSeconds,
        width: PLAYER_WORLD_SIZE,
        height: PLAYER_WORLD_SIZE,
      };
      const nextPlayer = isMoving && !isBlocked(candidate, caughtByPolice)
        ? { x: candidate.x, y: candidate.y, direction, isMoving }
        : { ...current, direction, isMoving: false };

      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);
      if (playerAction !== 'shoot') {
        setPlayerAction(nextPlayer.isMoving ? (isRunning ? 'run' : 'walk') : 'idle');
      }

      const currentBoss = bossRef.current;
      const followTarget = { x: nextPlayer.x - 60, y: nextPlayer.y + 58 };
      const bossDx = followTarget.x - currentBoss.x;
      const bossDy = followTarget.y - currentBoss.y;
      const bossDistance = Math.hypot(bossDx, bossDy);
      const bossMoves = bossDistance > 12;
      const bossStep = bossMoves ? Math.min(bossDistance, 150 * deltaSeconds) / bossDistance : 0;
      const nextBoss = bossMoves
        ? {
            x: currentBoss.x + bossDx * bossStep,
            y: currentBoss.y + bossDy * bossStep,
            direction: directionFromVector(bossDx, bossDy, currentBoss.direction),
            isMoving: true,
          }
        : { ...currentBoss, isMoving: false };
      bossRef.current = nextBoss;
      setBoss(nextBoss);

      npcsRef.current = npcsRef.current.map((npc) => {
        const target = npc.patrol[npc.targetIndex] ?? npc.patrol[0];
        const dx = target.x - npc.x;
        const dy = target.y - npc.y;
        const npcDistance = Math.hypot(dx, dy);
        if (npcDistance < 8) {
          return { ...npc, targetIndex: (npc.targetIndex + 1) % npc.patrol.length, isMoving: false };
        }
        const step = Math.min(npcDistance, npc.speed * deltaSeconds) / npcDistance;
        return {
          ...npc,
          x: npc.x + dx * step,
          y: npc.y + dy * step,
          direction: directionFromVector(dx, dy, npc.direction),
          isMoving: true,
        };
      });
      setNpcs(npcsRef.current);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
      lastTimestampRef.current = null;
    };
  }, [caughtByPolice, isRunning, playerAction]);

  const pressDirection = (direction: Direction) => {
    setActiveDirections((current) => (current.includes(direction) ? current : [...current, direction]));
  };

  const releaseDirection = (direction: Direction) => {
    setActiveDirections((current) => current.filter((item) => item !== direction));
  };

  const enterNearbyLocation = () => {
    if (!nearbyLocation) {
      setMessage('Move near a location entrance to interact.');
      return;
    }

    if (nearbyLocation.restricted && !caughtByPolice) {
      setMessage('Police Station is locked. It only opens if police catch you.');
      return;
    }

    setInsideLocation(nearbyLocation);
    setMessage(`${nearbyLocation.name}: ${nearbyLocation.interaction}`);
  };

  const travelTo = (locationId: string) => {
    const location = worldLocations.find((item) => item.id === locationId);
    if (!location) return;
    const spawn = centerOf(getLocationConfig(location.id).interactionZone);
    const nextPlayer = { x: spawn.x - PLAYER_WORLD_SIZE / 2, y: spawn.y, direction: 'down' as Direction, isMoving: false };
    playerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    setIsFlying(false);
    setInsideLocation(null);
    setMessage(`Plane/parachute travel complete: landed near ${location.name}.`);
  };

  const startFlight = (destinationId: WorldLocationId = flightDestinationId) => {
    setFlightDestinationId(destinationId);
    setIsFlying(true);
  };

  const simulateCaught = () => {
    setCaughtByPolice(true);
    const station = worldLocations.find((location) => location.id === 'policeStation');
    if (!station) return;
    const spawn = centerOf(getLocationConfig(station.id).interactionZone);
    const nextPlayer = { x: spawn.x, y: spawn.y, direction: 'up' as Direction, isMoving: false };
    playerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    setMessage('Police caught you. Police Station is now enterable for this sequence.');
  };

  const shoot = () => {
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    setActiveDirections([]);
    setPlayerAction('shoot');
    shootTimerRef.current = setTimeout(() => {
      setPlayerAction(playerRef.current.isMoving ? (isRunning ? 'run' : 'walk') : 'idle');
    }, 430);
  };

  if (isFlying) {
    return (
      <AirplaneFlight
        destinationId={flightDestinationId}
        worldLocations={worldLocations}
        onLand={travelTo}
        onReturnToAirport={() => setIsFlying(false)}
      />
    );
  }

  if (insideLocation) {
    const isAirport = insideLocation.id === 'airport';
    return (
      <View style={styles.root}>
        <View style={[styles.interior, { borderColor: insideLocation.accent }]}>
          {isAirport ? (
            <AirportInterior
              selectedDestinationId={flightDestinationId}
              destinations={airportDestinations}
              caughtByPolice={caughtByPolice}
              onSelectDestination={(destinationId) => {
                setFlightDestinationId(destinationId);
              }}
              onStartFlight={startFlight}
              onExit={() => setInsideLocation(null)}
            />
          ) : (
            <>
              <Text style={styles.interiorTitle}>{insideLocation.interiorTitle}</Text>
              <Text style={styles.interiorText}>{insideLocation.interiorDescription}</Text>
              <View style={styles.interiorStage}>
                <SpriteCharacter characterId="lunaCrown" direction="down" isMoving={false} currentAction="idle" scale={2.4} />
                <SpriteCharacter characterId="victorKane" direction="down" isMoving={false} currentAction="idle" scale={2.2} />
                {insideLocation.id === 'partyPartyYeah' ? (
                  <>
                    <SpriteCharacter characterId="pinkCoupleDancers" direction="down" isMoving currentAction="dance" scale={1.8} />
                    <SpriteCharacter characterId="purpleCoupleDance" direction="down" isMoving currentAction="dance" scale={1.8} />
                    <SpriteCharacter characterId="centerDancer" direction="down" isMoving currentAction="dance" scale={1.8} />
                  </>
                ) : null}
              </View>
            </>
          )}
          {!isAirport ? (
            <View style={styles.buttonRow}>
              <Pressable style={styles.primaryButton} onPress={onStartMission}>
                <Text style={styles.primaryButtonText}>START MISSION</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setInsideLocation(null)}>
                <Text style={styles.secondaryButtonText}>EXIT</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.world, { transform: [{ translateX: cameraX }, { translateY: cameraY }] }]}>
        {worldObjects.map((object) => (
          <View
            key={object.id}
            style={[
              styles.worldObject,
              {
                left: object.x,
                top: object.y,
                width: object.width,
                height: object.height,
                backgroundColor: object.color,
              },
              object.kind === 'road' && styles.road,
              object.kind === 'footpath' && styles.footpath,
              object.kind === 'water' && styles.water,
            ]}
          >
            {object.kind !== 'road' && object.kind !== 'footpath' ? <Text style={styles.objectLabel}>{object.label}</Text> : null}
          </View>
        ))}
        {worldLocations.map((location) => (
          <LocationTile key={location.id} location={location} caughtByPolice={caughtByPolice} />
        ))}

        {npcs.map((npc) => (
          <View key={npc.id} style={[styles.actor, { transform: [{ translateX: npc.x }, { translateY: npc.y }] }]}>
            <SpriteCharacter
              characterId={npc.characterId}
              direction={npc.direction}
              isMoving={npc.isMoving}
              currentAction={npc.role === 'dancer' ? 'dance' : npc.isMoving ? 'walk' : 'idle'}
              scale={npc.role === 'dancer' ? 1.5 : 1.8}
            />
            <Text style={styles.actorLabel}>{npc.name}</Text>
          </View>
        ))}

        <View style={[styles.actor, styles.bossActor, { transform: [{ translateX: boss.x }, { translateY: boss.y }] }]}>
          <SpriteCharacter characterId="victorKane" direction={boss.direction} isMoving={boss.isMoving} currentAction={boss.isMoving ? 'walk' : 'idle'} scale={2} />
        </View>
        <View style={[styles.actor, styles.playerActor, { transform: [{ translateX: player.x }, { translateY: player.y }] }]}>
          <SpriteCharacter characterId="lunaCrown" direction={player.direction} isMoving={player.isMoving} currentAction={playerAction} scale={2.15} />
        </View>
      </View>

      <View style={styles.hud}>
        <Text style={styles.title}>Sin Kingdom World</Text>
        <Text style={styles.status}>{nearbyLocation ? `${nearbyLocation.name}: ${nearbyLocation.interaction}` : message}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={enterNearbyLocation}>
          <Text style={styles.primaryButtonText}>{nearbyLocation ? 'INTERACT / ENTER' : 'INTERACT'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={simulateCaught}>
          <Text style={styles.secondaryButtonText}>POLICE CAUGHT TEST</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, isRunning && styles.activeButton]} onPress={() => setIsRunning((value) => !value)}>
          <Text style={styles.secondaryButtonText}>RUN</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={shoot}>
          <Text style={styles.secondaryButtonText}>SHOOT</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onBackToHideout}>
          <Text style={styles.secondaryButtonText}>HIDEOUT</Text>
        </Pressable>
      </View>
      <DPad activeDirections={activeDirections} onDirectionPressIn={pressDirection} onDirectionPressOut={releaseDirection} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08110d',
    overflow: 'hidden',
  },
  flightRoot: {
    flex: 1,
    backgroundColor: '#060816',
    overflow: 'hidden',
  },
  flightSky: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#101a3d',
  },
  flightSun: {
    position: 'absolute',
    right: 74,
    top: 82,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffbd66',
    shadowColor: '#ff61d8',
    shadowOpacity: 0.75,
    shadowRadius: 24,
  },
  flightCloud: {
    position: 'absolute',
    width: 170,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 210, 244, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  flightCityBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(7, 5, 20, 0.76)',
    borderTopWidth: 2,
    borderTopColor: '#ff2e8a',
  },
  destinationMarker: {
    position: 'absolute',
    width: 84,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: '#ff2e8a',
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  destinationMarkerText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  destinationMarkerTextSelected: {
    color: '#11040a',
  },
  flightPlane: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 74,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightPlaneIcon: {
    color: '#fff',
    fontSize: 46,
    fontWeight: '900',
    textShadowColor: '#8ee8ff',
    textShadowRadius: 12,
  },
  flightCabin: {
    position: 'absolute',
    left: 20,
    top: 17,
    flexDirection: 'row',
    gap: -6,
    opacity: 0.82,
    transform: [{ scale: 0.42 }],
  },
  flightHud: {
    position: 'absolute',
    left: 16,
    top: 14,
    width: 390,
    maxWidth: '54%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 4, 14, 0.82)',
    borderWidth: 2,
    borderColor: '#ffbd28',
  },
  flightTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 8,
  },
  flightText: {
    marginTop: 4,
    color: '#fbe6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  flightActions: {
    position: 'absolute',
    right: 18,
    top: 18,
    flexDirection: 'row',
    gap: 10,
  },
  world: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundColor: '#173d26',
  },
  worldObject: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  road: {
    borderWidth: 2,
    borderColor: '#484b55',
  },
  footpath: {
    borderRadius: 4,
  },
  water: {
    borderWidth: 2,
    borderColor: '#5ddfff',
  },
  objectLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  actor: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
  },
  playerActor: {
    zIndex: 20,
  },
  bossActor: {
    zIndex: 18,
  },
  actorLabel: {
    marginTop: -4,
    color: '#fff7d7',
    fontSize: 9,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 3,
  },
  hud: {
    position: 'absolute',
    left: 16,
    top: 16,
    maxWidth: 520,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 4, 10, 0.78)',
    borderWidth: 1,
    borderColor: '#ff2e8a',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  status: {
    marginTop: 4,
    color: '#f3d9ff',
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    position: 'absolute',
    right: 18,
    bottom: 22,
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
  primaryButtonText: {
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
  activeButton: {
    backgroundColor: 'rgba(255, 46, 138, 0.9)',
    borderColor: '#fff0a6',
  },
  disabledButton: {
    opacity: 0.52,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  interior: {
    flex: 1,
    margin: 18,
    borderWidth: 3,
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#130916',
  },
  airportHero: {
    flex: 1,
    minHeight: 280,
    justifyContent: 'flex-end',
    borderRadius: 14,
    overflow: 'hidden',
  },
  airportHeroImage: {
    borderRadius: 12,
  },
  airportShade: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 5, 14, 0.22)',
  },
  airportLogo: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(7, 6, 18, 0.72)',
    color: '#ffbd28',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  airportTitle: {
    marginTop: 4,
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    textShadowColor: '#00162b',
    textShadowRadius: 8,
  },
  airportSubtitle: {
    width: '72%',
    color: '#ffdf55',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowRadius: 5,
  },
  airportBoardingRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  airportPassenger: {
    width: 96,
    height: 92,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 12,
    backgroundColor: 'rgba(5, 2, 10, 0.74)',
    borderWidth: 1,
    borderColor: '#ff2e8a',
    overflow: 'hidden',
  },
  airportPassengerText: {
    paddingBottom: 5,
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  boardPlaneButton: {
    marginLeft: 'auto',
    minWidth: 220,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#ffbd28',
    borderWidth: 3,
    borderColor: '#fff0a6',
    shadowColor: '#ff7b00',
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  boardPlaneText: {
    color: '#120600',
    fontSize: 22,
    fontWeight: '900',
  },
  interiorTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
  },
  interiorText: {
    marginTop: 8,
    maxWidth: 800,
    color: '#ead9f5',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  interiorStage: {
    flex: 1,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#211020',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 138, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  travelPanel: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  panelTitle: {
    color: '#fff',
    fontWeight: '900',
    marginBottom: 8,
  },
  travelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  travelButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#26334a',
    borderWidth: 1,
    borderColor: '#6dbdff',
  },
  travelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});
