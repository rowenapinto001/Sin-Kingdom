import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, DeviceEventEmitter, Easing, NativeEventEmitter, NativeModules, Platform, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Bridge from '../components/Bridge';
import BoatControls from '../components/BoatControls';
import BoatVehicle from '../components/BoatVehicle';
import DPad from '../components/DPad';
import MiniMap from '../components/MiniMap';
import SpriteCharacter from '../components/SpriteCharacter';
import AtmosphereOverlay from '../components/world/AtmosphereOverlay';
import TrafficLight from '../components/world/TrafficLight';
import { airportDestinations } from '../data/airportDestinations';
import { allBridgeConfigs, getBridgeConfig } from '../data/bridgeConfigs';
import { gameSettings } from '../data/gameSettings';
import { allLocationConfigs, getLocationConfig } from '../data/locationConfigs';
import { trafficLights } from '../data/trafficLights';
import { worldRoadDecorations, worldRoadObjects } from '../data/worldRoads';
import { Direction } from '../game/types';
import { mergeDirectionInputs, useKeyboardControls } from '../hooks/useKeyboardControls';
import { useIndianTimeAtmosphere } from '../hooks/useIndianTimeAtmosphere';
import { CharacterAction } from '../types/CharacterAnimation';
import { isBlockedByLocation } from './collision';
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
import { Rect, WorldLocation, WorldLocationId, WorldNpc, WorldObject } from './worldTypes';
import AirplaneFlight from './locations/AirplaneFlight';
import AirportInterior from './locations/AirportInterior';
import FriendsHouseExterior from './locations/FriendsHouseExterior';
import FriendsHouseExteriorScene from './locations/FriendsHouseExteriorScene';
import FriendsHouseInterior from './locations/FriendsHouseInterior';
import LandscapeLayer, { FullWorldGrass } from './gardenDecorations';

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

type PlayerMode = 'walking' | 'driving_boat';
type FriendsHouseScene = 'exterior' | 'interior';

type BoatState = {
  x: number;
  y: number;
  heading: number;
  speed: number;
  fuel: number;
  isMoving: boolean;
};

type FootstepPoint = {
  id: number;
  x: number;
  y: number;
};

type MainWorldMapProps = {
  onStartMission: () => void;
  onBackToHideout: () => void;
};

type ShipSide = 'west' | 'east' | 'bridge';

// Boating Dock sits at (900,700,1300,900); the sea corridor runs south from
type AndroidHardwareKeyEvent = {
  type?: 'keydown' | 'keyup';
  key?: string;
};

const ANDROID_HARDWARE_KEY_EVENT = 'SinKingdomHardwareKey';
const hardwareKeyboardModule = NativeModules.SinKingdomHardwareKeyboard;
// there along the west vertical road down toward Rani-Raj Mahal and the
// Airport, crossed by the Friends Canal Bridge near y=3300.
const SHIP_DOCK_ZONES: Array<Rect & { side: ShipSide }> = [
  { side: 'west', x: 850, y: 1500, width: 430, height: 350 },
  { side: 'bridge', x: 1150, y: 3150, width: 340, height: 300 },
  { side: 'east', x: 850, y: 5600, width: 440, height: 300 },
];
const BOAT_WORLD_WIDTH = 102;
const BOAT_WORLD_HEIGHT = 54;
const WALK_SPEED_MULTIPLIER = 2.15;
const BOAT_STEER_SPEED = 360;
const BOAT_ACCELERATION = 820;
const BOAT_MAX_FORWARD_SPEED = 520;
const BOAT_MAX_REVERSE_SPEED = -220;
const BOAT_WATER_LANES: Rect[] = [
  { x: 750, y: 700, width: 900, height: 5300 },
  { x: 900, y: 700, width: 1100, height: 850 },
];
const BOAT_BLOCKERS: Rect[] = [
  { x: 1200, y: 2700, width: 450, height: 950 },
  { x: 750, y: 5200, width: 900, height: 1000 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pointInRect(point: { x: number; y: number }, rect: Rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function rectCenter(rect: Rect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function isBlockedByBridgeRails(rect: Rect) {
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  return allBridgeConfigs.some((bridge) => {
    if (!pointInRect(center, bridge.bounds)) return false;
    return bridge.collisionBoxes.some((area) => pointInRect(center, area));
  });
}

function isWaterAt(rect: Rect) {
  const samplePoints = [
    rectCenter(rect),
    { x: rect.x + 10, y: rect.y + 10 },
    { x: rect.x + rect.width - 10, y: rect.y + 10 },
    { x: rect.x + 10, y: rect.y + rect.height - 10 },
    { x: rect.x + rect.width - 10, y: rect.y + rect.height - 10 },
  ];

  return samplePoints.some((point) => {
    const onBridgeWalkway = allBridgeConfigs.some((bridge) => bridge.walkableAreas.some((area) => pointInRect(point, area)));
    if (onBridgeWalkway) return false;
    return worldObjects.some((object) => object.kind === 'water' && pointInRect(point, object));
  });
}

function isBoatDrivableAt(rect: Rect) {
  const samplePoints = [
    rectCenter(rect),
    { x: rect.x + 18, y: rect.y + 14 },
    { x: rect.x + rect.width - 18, y: rect.y + 14 },
    { x: rect.x + 18, y: rect.y + rect.height - 14 },
    { x: rect.x + rect.width - 18, y: rect.y + rect.height - 14 },
  ];
  return samplePoints.every((point) => (
    BOAT_WATER_LANES.some((area) => pointInRect(point, area)) &&
    !BOAT_BLOCKERS.some((area) => pointInRect(point, area))
  ));
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
function directionFromHardwareKey(key?: string): Direction | undefined {
  switch ((key ?? '').trim().toLowerCase()) {
    case 'arrowup':
    case 'up':
    case 'w':
      return 'up';
    case 'arrowdown':
    case 'down':
    case 's':
      return 'down';
    case 'arrowleft':
    case 'left':
    case 'a':
      return 'left';
    case 'arrowright':
    case 'right':
    case 'd':
      return 'right';
    default:
      return undefined;
  }
}

  const locationConfig = allLocationConfigs.find((location) =>
    rectsOverlap({ x: actorCenter.x - 4, y: actorCenter.y - 4, width: 8, height: 8 }, location.interactionZone),
  );
  return locationConfig ? worldLocations.find((location) => location.id === locationConfig.id) : undefined;
}

function nearestShipDock(actor: WorldActor) {
  const actorCenter = { x: actor.x + PLAYER_WORLD_SIZE / 2, y: actor.y + PLAYER_WORLD_SIZE / 2 };
  return SHIP_DOCK_ZONES.find((dock) =>
    rectsOverlap({ x: actorCenter.x - 40, y: actorCenter.y - 40, width: 80, height: 80 }, dock),
  );
}

function nearestDockToRect(rect: Rect) {
  const center = rectCenter(rect);
  return SHIP_DOCK_ZONES.find((dock) => pointInRect(center, dock));
}

function boatSpawnForDock(side: ShipSide): BoatState {
  if (side === 'bridge') {
    return {
      x: 1200,
      y: 3320,
      heading: 0,
      speed: 0,
      fuel: 100,
      isMoving: false,
    };
  }

  return {
    x: side === 'west' ? 1050 : 1050,
    y: side === 'west' ? 1150 : 5750,
    heading: side === 'west' ? 90 : 270,
    speed: 0,
    fuel: 100,
    isMoving: false,
  };
}

function worldObjectLayer(object: WorldObject) {
  if (object.kind === 'water') return 1;
  if (object.kind === 'sand' || object.kind === 'grass' || object.kind === 'decor') return 2;
  if (object.kind === 'footpath') return 3;
  if (object.kind === 'road' || object.kind === 'vehicle' || object.kind === 'stage') return 4;
  if (object.kind === 'bridge') return 5;
  return 3;
}

function RoadMarkings({ object }: { object: Rect }) {
  const horizontal = object.width >= object.height;
  const count = Math.max(1, Math.floor((horizontal ? object.width : object.height) / 170));
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            horizontal ? styles.roadDashHorizontal : styles.roadDashVertical,
            horizontal ? { left: 42 + index * 166 } : { top: 42 + index * 166 },
          ]}
        />
      ))}
      <View style={horizontal ? styles.roadEdgeTop : styles.roadEdgeLeft} />
      <View style={horizontal ? styles.roadEdgeBottom : styles.roadEdgeRight} />
    </>
  );
}

function WaterDetails({ object, waveShift }: { object: Rect; waveShift: Animated.Value }) {
  const columns = Math.max(4, Math.ceil(object.width / 150));
  const rows = Math.max(3, Math.ceil(object.height / 125));
  const rippleCount = Math.min(190, columns * rows);
  const bandCount = Math.min(34, Math.max(3, Math.floor(object.height / 270)));
  const waveTranslate = waveShift.interpolate({ inputRange: [0, 1], outputRange: [-90, 90] });
  const reverseWaveTranslate = waveShift.interpolate({ inputRange: [0, 1], outputRange: [80, -80] });

  return (
    <>
      <View style={styles.waterDepthGlow} />
      {Array.from({ length: bandCount }).map((_, index) => (
        <Animated.View
          key={`current-${index}`}
          style={[
            styles.waterCurrentBand,
            {
              left: index % 2 === 0 ? -80 : 60,
              top: 54 + index * 255,
              width: object.width + 160,
              transform: [
                { translateX: index % 2 === 0 ? waveTranslate : reverseWaveTranslate },
                { rotate: index % 2 === 0 ? '-3deg' : '3deg' },
              ],
            },
          ]}
        />
      ))}
      {Array.from({ length: rippleCount }).map((_, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        return (
          <Animated.View
            key={index}
            style={[
              styles.waterRipple,
              {
                left: 28 + col * 146 + (row % 2) * 42,
                top: 32 + row * 118,
                width: 54 + ((index + row) % 4) * 18,
                opacity: 0.28 + ((index % 5) * 0.06),
                transform: [{ translateX: row % 2 === 0 ? waveTranslate : reverseWaveTranslate }],
              },
            ]}
          />
        );
      })}
      {Array.from({ length: Math.min(70, Math.max(12, Math.floor(rippleCount / 2))) }).map((_, index) => (
        <Animated.View
          key={`shine-${index}`}
          style={[
            styles.waterShineLine,
            {
              left: 18 + ((index * 211) % Math.max(100, object.width - 120)),
              top: 22 + ((index * 179) % Math.max(100, object.height - 100)),
              width: 84 + (index % 4) * 28,
              transform: [
                { translateX: index % 2 === 0 ? reverseWaveTranslate : waveTranslate },
                { rotate: index % 3 === 0 ? '-9deg' : '7deg' },
              ],
            },
          ]}
        />
      ))}
      {Array.from({ length: Math.min(85, Math.max(8, Math.floor((object.width * object.height) / 82000))) }).map((_, index) => (
        <View
          key={`foam-${index}`}
          style={[
            styles.waterFoamDot,
            {
              left: 42 + ((index * 139) % Math.max(100, object.width - 70)),
              top: 44 + ((index * 317) % Math.max(100, object.height - 90)),
            },
          ]}
        />
      ))}
      <View style={styles.waterShoreTop} />
      <View style={styles.waterShoreBottom} />
      <View style={styles.waterShoreLeft} />
      <View style={styles.waterShoreRight} />
      <View style={[styles.waterCornerStone, styles.waterCornerTopLeft]} />
      <View style={[styles.waterCornerStone, styles.waterCornerTopRight]} />
      <View style={[styles.waterCornerStone, styles.waterCornerBottomLeft]} />
      <View style={[styles.waterCornerStone, styles.waterCornerBottomRight]} />
    </>
  );
}

function BridgeDetails({ object }: { object: WorldObject }) {
  const config = getBridgeConfig(object.id);
  if (!config) return null;
  return (
    <Bridge config={config} />
  );
}

function BridgeApproachLayer() {
  return (
    <>
      <View style={[styles.bridgeApproachRoad, { left: 1370, top: 1768, width: 210, height: 104 }]}>
        <RoadMarkings object={{ x: 0, y: 0, width: 210, height: 104 }} />
      </View>
      <View style={[styles.bridgeApproachSidewalk, { left: 1370, top: 1724, width: 210, height: 34 }]} />
      <View style={[styles.bridgeApproachSidewalk, { left: 1370, top: 1882, width: 210, height: 34 }]} />
    </>
  );
}

function BoatDockLayer() {
  return (
    <>
      <BoatDock side="west" x={255} y={535} label="BOATING DOCK" />
      <BoatDock side="bridge" x={1130} y={1918} label="BRIDGE BOAT" />
      <BoatDock side="east" x={280} y={7770} label="FAR SEA DOCK" />
    </>
  );
}

function BoatDock({ side, x, y, label }: { side: ShipSide; x: number; y: number; label: string }) {
  const boatRotation = side === 'west' ? '-8deg' : side === 'bridge' ? '0deg' : '188deg';
  return (
    <View style={[styles.boatDock, { left: x, top: y }]}>
      <View style={styles.dockPlanks}>
      {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={[styles.dockPlankLine, { left: 10 + index * 24 }]} />
        ))}
      </View>
      <View style={[styles.mapBoat, { transform: [{ rotate: boatRotation }] }]}>
        <View style={styles.mapBoatWake} />
        <View style={styles.mapBoatHull}>
          <View style={styles.mapBoatSeatLeft}>
            <SpriteCharacter characterId="lunaCrown" direction="down" isMoving={false} currentAction="idle" scale={0.72} />
          </View>
          <View style={styles.mapBoatWheel}>
            <View style={styles.mapBoatWheelHub} />
          </View>
          <View style={styles.mapBoatSeatRight}>
            <SpriteCharacter characterId="victorKane" direction="down" isMoving={false} currentAction="idle" scale={0.64} />
          </View>
          <View style={styles.mapBoatCabin} />
        </View>
      </View>
      <View style={styles.dockLabel}>
        <Text style={styles.dockLabelText}>{label}</Text>
        <Text style={styles.dockHintText}>ENTER BOAT</Text>
      </View>
    </View>
  );
}

function NpcBridgeBoats({ boatA, boatB }: { boatA: Animated.Value; boatB: Animated.Value }) {
  const boatATranslateX = boatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 210, 28] });
  const boatATranslateY = boatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 34, -18] });
  const boatARotate = boatA.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-6deg', '8deg', '-4deg'] });
  const boatBTranslateX = boatB.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -240, -26] });
  const boatBTranslateY = boatB.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -30, 22] });
  const boatBRotate = boatB.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['184deg', '170deg', '190deg'] });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.npcWaterBoat,
          {
            left: 145,
            top: 1608,
            transform: [{ translateX: boatATranslateX }, { translateY: boatATranslateY }, { rotate: boatARotate }],
          },
        ]}
      >
        <View style={styles.npcBoatWake} />
        <View style={styles.npcBoatHull}>
          <View style={styles.npcBoatNose} />
          <View style={styles.npcBoatSeat}>
            <SpriteCharacter characterId="npcMan" direction="down" isMoving currentAction="idle" scale={0.74} />
          </View>
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.npcWaterBoat,
          {
            left: 1125,
            top: 1972,
            transform: [{ translateX: boatBTranslateX }, { translateY: boatBTranslateY }, { rotate: boatBRotate }],
          },
        ]}
      >
        <View style={styles.npcBoatWake} />
        <View style={[styles.npcBoatHull, styles.npcBoatHullAlt]}>
          <View style={styles.npcBoatNose} />
          <View style={styles.npcBoatSeat}>
            <SpriteCharacter characterId="npcWoman" direction="down" isMoving currentAction="idle" scale={0.74} />
          </View>
        </View>
      </Animated.View>
    </>
  );
}

function RoadDecorationLayer({ lightsEnabled, glowColor }: { lightsEnabled: boolean; glowColor: string }) {
  return (
    <>
      {worldRoadDecorations.map((decoration) => {
        if (decoration.type === 'crosswalk') {
          const horizontal = decoration.width >= decoration.height;
          return (
            <View
              key={decoration.id}
              style={[
                styles.crosswalk,
                {
                  left: decoration.x,
                  top: decoration.y,
                  width: decoration.width,
                  height: decoration.height,
                  flexDirection: horizontal ? 'column' : 'row',
                },
              ]}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <View key={index} style={horizontal ? styles.crosswalkStripeHorizontal : styles.crosswalkStripeVertical} />
              ))}
            </View>
          );
        }
        if (decoration.type === 'trafficLight') {
          return null;
        }
        if (decoration.type === 'streetLamp') {
          return (
            <View key={decoration.id} style={[styles.streetLamp, { left: decoration.x, top: decoration.y }]}>
              <View
                style={[
                  styles.lampGlow,
                  lightsEnabled && styles.lampGlowActive,
                  lightsEnabled && { backgroundColor: glowColor },
                ]}
              />
              <View style={styles.lampPost} />
            </View>
          );
        }
        return (
          <View key={decoration.id} style={[styles.roadSign, { left: decoration.x, top: decoration.y }]}>
            <Text style={styles.roadSignText} numberOfLines={2}>
              {decoration.label}
            </Text>
          </View>
        );
      })}
    </>
  );
}

export default function MainWorldMap({ onStartMission, onBackToHideout }: MainWorldMapProps) {
  const { width, height } = useWindowDimensions();
  const atmosphere = useIndianTimeAtmosphere();
  const waveShift = useRef(new Animated.Value(0)).current;
  const npcBoatA = useRef(new Animated.Value(0)).current;
  const npcBoatB = useRef(new Animated.Value(0)).current;
  const [touchDirections, setTouchDirections] = useState<Direction[]>([]);
  const touchDirectionsRef = useRef<Direction[]>([]);
  const activeDirectionsRef = useRef<Direction[]>([]);
  const [isFlying, setIsFlying] = useState(false);
  const [hardwareDirections, setHardwareDirections] = useState<Direction[]>([]);
  const hardwareDirectionsRef = useRef<Direction[]>([]);
  const [playerMode, setPlayerMode] = useState<PlayerMode>('walking');
  const playerModeRef = useRef<PlayerMode>('walking');
  const [boat, setBoat] = useState<BoatState>(() => boatSpawnForDock('west'));
  const boatRef = useRef<BoatState>(boat);
  const [flightDestinationId, setFlightDestinationId] = useState<WorldLocationId>('playerHouse');
  const [caughtByPolice, setCaughtByPolice] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [playerAction, setPlayerAction] = useState<CharacterAction>('idle');
  const playerActionRef = useRef<CharacterAction>('idle');
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
  const [footsteps, setFootsteps] = useState<FootstepPoint[]>([]);
  const footstepsRef = useRef<FootstepPoint[]>([]);
  const footstepIdRef = useRef(0);
  const lastFootstepRef = useRef({ x: PLAYER_HOUSE_SPAWN.x, y: PLAYER_HOUSE_SPAWN.y });
  const [insideLocation, setInsideLocation] = useState<WorldLocation | null>(null);
  const [friendsHouseScene, setFriendsHouseScene] = useState<FriendsHouseScene>('exterior');
  const [message, setMessage] = useState('Start at Player House. Roads connect every major place outward from the center.');
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const lastSafePlayerRef = useRef<WorldActor>({
    x: PLAYER_HOUSE_SPAWN.x,
    y: PLAYER_HOUSE_SPAWN.y,
    direction: 'down',
    isMoving: false,
  });
  const keyboardControls = useKeyboardControls({
    enabled: gameSettings.keyboardControlsEnabled,
    disabled: Boolean(insideLocation) || isFlying,
  });
  const activeDirections = useMemo(
    () => mergeDirectionInputs(touchDirections, hardwareDirections, keyboardControls.activeDirections),
    [hardwareDirections, keyboardControls.activeDirections, touchDirections],
  );
  const clearMovementInput = useCallback(() => {
    touchDirectionsRef.current = [];
    setTouchDirections([]);
    keyboardControls.resetKeyboardControls();
    hardwareDirectionsRef.current = [];
    activeDirectionsRef.current = [];
    setHardwareDirections([]);
  }, [keyboardControls.resetKeyboardControls]);

  const nearbyLocation = useMemo(() => nearestLocation(player), [player]);
  const nearbyDock = useMemo(() => nearestShipDock(player), [player]);
  const boatDock = useMemo(() => nearestDockToRect({ x: boat.x, y: boat.y, width: BOAT_WORLD_WIDTH, height: BOAT_WORLD_HEIGHT }), [boat]);
  const cameraTarget = playerMode === 'driving_boat' ? { x: boat.x + BOAT_WORLD_WIDTH / 2, y: boat.y + BOAT_WORLD_HEIGHT / 2 } : { x: player.x, y: player.y };
  const lookAheadDistance = playerMode === 'driving_boat' ? Math.min(170, Math.abs(boat.speed) * 1.7) : 0;
  const lookAheadX = playerMode === 'driving_boat' ? Math.cos((boat.heading * Math.PI) / 180) * lookAheadDistance : 0;
  const lookAheadY = playerMode === 'driving_boat' ? Math.sin((boat.heading * Math.PI) / 180) * lookAheadDistance : 0;
  const cameraX = clamp(width / 2 - cameraTarget.x - lookAheadX, width - WORLD_WIDTH, 0);
  const cameraY = clamp(height / 2 - cameraTarget.y - lookAheadY, height - WORLD_HEIGHT, 0);

  useEffect(() => {
    const waveAnimation = Animated.loop(
      Animated.timing(waveShift, {
        toValue: 1,
        duration: 3800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const boatAAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(npcBoatA, { toValue: 1, duration: 6200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(npcBoatA, { toValue: 0, duration: 5600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const boatBAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(npcBoatB, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(npcBoatB, { toValue: 0, duration: 6100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    waveAnimation.start();
    boatAAnimation.start();
    boatBAnimation.start();
    return () => {
      waveAnimation.stop();
      boatAAnimation.stop();
      boatBAnimation.stop();
    };
  }, [npcBoatA, npcBoatB, waveShift]);

  useEffect(() => {
    activeDirectionsRef.current = activeDirections;
  }, [activeDirections]);

  useEffect(() => {
    playerActionRef.current = playerAction;
  useEffect(() => {
    if (Platform.OS !== 'android' || !gameSettings.keyboardControlsEnabled || Boolean(insideLocation) || isFlying) return undefined;

    const updateHardwareDirection = (event: AndroidHardwareKeyEvent) => {
      const direction = directionFromHardwareKey(event.key);
      if (!direction) return;

      const isPressed = event.type === 'keydown';
      const current = hardwareDirectionsRef.current;
      const next = isPressed
        ? current.includes(direction)
          ? current
          : [...current, direction]
        : current.filter((item) => item !== direction);

      if (next === current) return;
      hardwareDirectionsRef.current = next;
      activeDirectionsRef.current = mergeDirectionInputs(touchDirectionsRef.current, next, keyboardControls.activeDirections);
      setHardwareDirections(next);
    };

    const deviceSubscription = DeviceEventEmitter.addListener(ANDROID_HARDWARE_KEY_EVENT, updateHardwareDirection);
    const nativeEmitter = hardwareKeyboardModule ? new NativeEventEmitter(hardwareKeyboardModule) : null;
    const nativeSubscription = nativeEmitter?.addListener(ANDROID_HARDWARE_KEY_EVENT, updateHardwareDirection);

    return () => {
      deviceSubscription.remove();
      nativeSubscription?.remove();
      hardwareDirectionsRef.current = [];
      setHardwareDirections([]);
    };
  }, [insideLocation, isFlying, keyboardControls.activeDirections]);

  }, [playerAction]);

  useEffect(() => {
    playerModeRef.current = playerMode;
  }, [playerMode]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaSeconds = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
      lastTimestampRef.current = timestamp;

      if (playerModeRef.current === 'driving_boat') {
        const currentBoat = boatRef.current;
        const directions = activeDirectionsRef.current;
        const steering = (directions.includes('left') ? -1 : 0) + (directions.includes('right') ? 1 : 0);
        const throttle = directions.includes('up') ? 1 : directions.includes('down') ? -0.7 : 0;
        const heading = (currentBoat.heading + steering * BOAT_STEER_SPEED * deltaSeconds + 360) % 360;
        const rawSpeed = currentBoat.speed + throttle * BOAT_ACCELERATION * deltaSeconds - Math.sign(currentBoat.speed) * 8 * deltaSeconds;
        const speed = Math.abs(rawSpeed) < 1 ? 0 : clamp(rawSpeed, BOAT_MAX_REVERSE_SPEED, BOAT_MAX_FORWARD_SPEED);
        const radians = (heading * Math.PI) / 180;
        const candidate = {
          x: currentBoat.x + Math.cos(radians) * speed * deltaSeconds,
          y: currentBoat.y + Math.sin(radians) * speed * deltaSeconds,
          width: BOAT_WORLD_WIDTH,
          height: BOAT_WORLD_HEIGHT,
        };
        const canMoveBoat = isBoatDrivableAt(candidate);
        const nextBoat = {
          ...currentBoat,
          x: canMoveBoat ? clamp(candidate.x, 0, WORLD_WIDTH - BOAT_WORLD_WIDTH) : currentBoat.x,
          y: canMoveBoat ? clamp(candidate.y, 0, WORLD_HEIGHT - BOAT_WORLD_HEIGHT) : currentBoat.y,
          heading,
          speed: canMoveBoat ? speed : 0,
          fuel: Math.max(0, currentBoat.fuel - Math.abs(speed) * 0.004 * deltaSeconds),
          isMoving: canMoveBoat && Math.abs(speed) > 2,
        };

        boatRef.current = nextBoat;
        setBoat(nextBoat);

        const attachedPlayer = {
          x: nextBoat.x + 34,
          y: nextBoat.y + 10,
          direction: 'down' as Direction,
          isMoving: nextBoat.isMoving,
        };
        const attachedBoss = {
          x: nextBoat.x + 82,
          y: nextBoat.y + 12,
          direction: 'down' as Direction,
          isMoving: false,
        };
        playerRef.current = attachedPlayer;
        bossRef.current = attachedBoss;
        setPlayer(attachedPlayer);
        setBoss(attachedBoss);
        setPlayerAction('idle');

        if (!canMoveBoat && Math.abs(speed) > 6) {
          setMessage('Boat blocked. Stay inside the real river lane and avoid bridge edges.');
        } else {
          const dock = nearestDockToRect({ x: nextBoat.x, y: nextBoat.y, width: BOAT_WORLD_WIDTH, height: BOAT_WORLD_HEIGHT });
          setMessage(dock ? 'Dock reached. Press EXIT BOAT to continue walking.' : 'Boat mode: FRONT moves forward, BACK reverses, LEFT/RIGHT steer through the long sea.');
        }

        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const current = playerRef.current;
      const vector = movementVector(activeDirectionsRef.current);
      const isMoving = vector.dx !== 0 || vector.dy !== 0;
      const direction = directionFromVector(vector.dx, vector.dy, current.direction);
      const movementSpeed = PLAYER_WORLD_SPEED * WALK_SPEED_MULTIPLIER * (isRunning ? 1.65 : 1);
      const candidate = {
        x: current.x + vector.dx * movementSpeed * deltaSeconds,
        y: current.y + vector.dy * movementSpeed * deltaSeconds,
        width: PLAYER_WORLD_SIZE,
        height: PLAYER_WORLD_SIZE,
      };
      const bridgeBlocked = isBlockedByBridgeRails(candidate);
      const locationBlocked = isBlockedByLocation(candidate);
      const waterHit = isWaterAt(candidate);
      const nextPlayer = isMoving
        ? waterHit
          ? { ...lastSafePlayerRef.current, direction, isMoving: false }
          : {
              x: bridgeBlocked || locationBlocked ? current.x : clamp(candidate.x, 0, WORLD_WIDTH - PLAYER_WORLD_SIZE),
              y: bridgeBlocked || locationBlocked ? current.y : clamp(candidate.y, 0, WORLD_HEIGHT - PLAYER_WORLD_SIZE),
              direction,
              isMoving: !bridgeBlocked && !locationBlocked,
            }
        : { ...current, direction, isMoving: false };

      if (waterHit) {
        clearMovementInput();
        setMessage('Splash! Water is boat-only. Walk to BOATING DOCK, press INTERACT, then use FRONT/BACK and LEFT/RIGHT to drive the boat.');
      } else if (nextPlayer.isMoving) {
        lastSafePlayerRef.current = nextPlayer;
      }

      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);
      if (nextPlayer.isMoving) {
        const lastFootstep = lastFootstepRef.current;
        const footstepDistance = Math.hypot(nextPlayer.x - lastFootstep.x, nextPlayer.y - lastFootstep.y);
        if (footstepDistance > 92) {
          lastFootstepRef.current = { x: nextPlayer.x, y: nextPlayer.y };
          footstepIdRef.current += 1;
          footstepsRef.current = [
            ...footstepsRef.current.slice(-31),
            {
              id: footstepIdRef.current,
              x: nextPlayer.x + PLAYER_WORLD_SIZE / 2,
              y: nextPlayer.y + PLAYER_WORLD_SIZE / 2,
            },
          ];
          setFootsteps(footstepsRef.current);
        }
      }
      if (playerActionRef.current !== 'shoot') {
        setPlayerAction(nextPlayer.isMoving ? (isRunning ? 'run' : 'walk') : 'idle');
      }

      const currentBoss = bossRef.current;
      const followTarget = { x: nextPlayer.x - 60, y: nextPlayer.y + 58 };
      const bossDx = followTarget.x - currentBoss.x;
      const bossDy = followTarget.y - currentBoss.y;
      const bossDistance = Math.hypot(bossDx, bossDy);
      const bossMoves = bossDistance > 12;
      const bossStep = bossMoves ? Math.min(bossDistance, 230 * deltaSeconds) / bossDistance : 0;
      const bossCandidate = {
        x: currentBoss.x + bossDx * bossStep,
        y: currentBoss.y + bossDy * bossStep,
        width: PLAYER_WORLD_SIZE,
        height: PLAYER_WORLD_SIZE,
      };
      const bossBlocked = isBlockedByBridgeRails(bossCandidate) || isWaterAt(bossCandidate);
      const nextBoss = bossMoves
        ? {
            x: bossBlocked ? currentBoss.x : bossCandidate.x,
            y: bossBlocked ? currentBoss.y : bossCandidate.y,
            direction: directionFromVector(bossDx, bossDy, currentBoss.direction),
            isMoving: !bossBlocked,
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
  }, [caughtByPolice, clearMovementInput, isRunning]);

  const pressDirection = (direction: Direction) => {
    const next = touchDirectionsRef.current.includes(direction) ? touchDirectionsRef.current : [...touchDirectionsRef.current, direction];
    touchDirectionsRef.current = next;
    activeDirectionsRef.current = mergeDirectionInputs(next, hardwareDirectionsRef.current, keyboardControls.activeDirections);
    setTouchDirections(next);
  };

  const releaseDirection = (direction: Direction) => {
    const next = touchDirectionsRef.current.filter((item) => item !== direction);
    touchDirectionsRef.current = next;
    activeDirectionsRef.current = mergeDirectionInputs(next, hardwareDirectionsRef.current, keyboardControls.activeDirections);
    setTouchDirections(next);
  };

  const enterNearbyLocation = () => {
    if (nearbyDock) {
      const nextBoat = boatSpawnForDock(nearbyDock.side);
      boatRef.current = nextBoat;
      setBoat(nextBoat);
      setPlayerMode('driving_boat');
      playerModeRef.current = 'driving_boat';
      clearMovementInput();
      setMessage('Luna and the Boss entered the boat. Drive the long sea route from the Boating Dock.');
      return;
    }

    if (!nearbyLocation) {
      setMessage('Move near a location entrance or boat dock to interact.');
      return;
    }

    if (nearbyLocation.restricted && !caughtByPolice) {
      setMessage('Police Station is locked. It only opens if police catch you.');
      return;
    }

    clearMovementInput();
    setInsideLocation(nearbyLocation);
    if (nearbyLocation.id === 'friendsHouse') {
      setFriendsHouseScene('exterior');
    }
    setMessage(`${nearbyLocation.name}: ${nearbyLocation.interaction}`);
  };

  const travelTo = (locationId: string) => {
    const location = worldLocations.find((item) => item.id === locationId);
    if (!location) return;
    const spawn = centerOf(getLocationConfig(location.id).interactionZone);
    const nextPlayer = { x: spawn.x - PLAYER_WORLD_SIZE / 2, y: spawn.y, direction: 'down' as Direction, isMoving: false };
    playerRef.current = nextPlayer;
    lastSafePlayerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    lastFootstepRef.current = { x: nextPlayer.x, y: nextPlayer.y };
    footstepsRef.current = [];
    setFootsteps([]);
    clearMovementInput();
    setIsFlying(false);
    setInsideLocation(null);
    setMessage(`Plane/parachute travel complete: landed near ${location.name}.`);
  };

  const startFlight = (destinationId: WorldLocationId = flightDestinationId) => {
    setFlightDestinationId(destinationId);
    clearMovementInput();
    setIsFlying(true);
  };

  const brakeBoat = () => {
    boatRef.current = { ...boatRef.current, speed: 0, isMoving: false };
    setBoat(boatRef.current);
  };

  const exitBoat = () => {
    const dock = nearestDockToRect({ x: boatRef.current.x, y: boatRef.current.y, width: BOAT_WORLD_WIDTH, height: BOAT_WORLD_HEIGHT });
    if (!dock) {
      setMessage('Find a dock or shoreline exit point before leaving the boat.');
      return;
    }
    const dockExit =
      dock.side === 'bridge'
        ? { x: 1110, y: 1810, direction: 'up' as Direction }
        : {
            x: dock.side === 'west' ? 330 : 360,
            y: dock.side === 'west' ? 560 : 7770,
            direction: dock.side === 'west' ? 'down' as Direction : 'up' as Direction,
          };
    const nextPlayer = {
      x: dockExit.x,
      y: dockExit.y,
      direction: dockExit.direction,
      isMoving: false,
    };
    const nextBoss = {
      x: nextPlayer.x - 58,
      y: nextPlayer.y + 52,
      direction: nextPlayer.direction,
      isMoving: false,
    };
    playerRef.current = nextPlayer;
    bossRef.current = nextBoss;
    lastSafePlayerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    setBoss(nextBoss);
    lastFootstepRef.current = { x: nextPlayer.x, y: nextPlayer.y };
    setPlayerMode('walking');
    playerModeRef.current = 'walking';
    clearMovementInput();
    setMessage(`Boat docked on the ${dock.side} side of the bridge. Boss came with Luna.`);
  };

  const simulateCaught = () => {
    setCaughtByPolice(true);
    const station = worldLocations.find((location) => location.id === 'policeStation');
    if (!station) return;
    const spawn = centerOf(getLocationConfig(station.id).interactionZone);
    const nextPlayer = { x: spawn.x, y: spawn.y, direction: 'up' as Direction, isMoving: false };
    playerRef.current = nextPlayer;
    lastSafePlayerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    lastFootstepRef.current = { x: nextPlayer.x, y: nextPlayer.y };
    setMessage('Police caught you. Police Station is now enterable for this sequence.');
  };

  const shoot = () => {
    if (shootTimerRef.current) clearTimeout(shootTimerRef.current);
    clearMovementInput();
    playerActionRef.current = 'shoot';
    setPlayerAction('shoot');
    shootTimerRef.current = setTimeout(() => {
      const nextAction = playerRef.current.isMoving ? (isRunning ? 'run' : 'walk') : 'idle';
      playerActionRef.current = nextAction;
      setPlayerAction(nextAction);
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

  if (insideLocation?.id === 'friendsHouse') {
    if (friendsHouseScene === 'interior') {
      return <FriendsHouseInterior onExit={() => setFriendsHouseScene('exterior')} onMissionStart={onStartMission} />;
    }
    return (
      <FriendsHouseExteriorScene
        onEnterHouse={() => setFriendsHouseScene('interior')}
        onExitWorld={() => {
          setInsideLocation(null);
          setFriendsHouseScene('exterior');
        }}
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
      {Platform.OS !== 'web' ? (
        <TextInput
          autoFocus
          caretHidden
          showSoftInputOnFocus={false}
          value=""
          onKeyPress={(event) => keyboardControls.onNativeKeyPress(event)}
          style={styles.keyboardInput}
        />
      ) : null}
      <View style={[styles.world, { transform: [{ translateX: cameraX }, { translateY: cameraY }] }]}>
        <FullWorldGrass width={WORLD_WIDTH} height={WORLD_HEIGHT} />
        <LandscapeLayer />
        {[...worldObjects].sort((a, b) => worldObjectLayer(a) - worldObjectLayer(b)).map((object) => (
          <View
            key={object.id}
            style={[
              styles.worldObject,
          blurOnSubmit={false}
          autoCorrect={false}
              {
                left: object.x,
                top: object.y,
                width: object.width,
                height: object.height,
                backgroundColor: object.color,
                transform: object.rotate ? [{ rotate: object.rotate }] : undefined,
              },
              object.kind === 'road' && styles.road,
              object.kind === 'bridge' && styles.bridge,
              object.kind === 'footpath' && styles.footpath,
              object.kind === 'water' && styles.water,
              object.id === 'garden-lake' && styles.poolWater,
            ]}
          >
            {object.kind === 'road' ? <RoadMarkings object={object} /> : null}
            {object.kind === 'bridge' ? <BridgeDetails object={object} /> : null}
            {object.kind === 'water' ? <WaterDetails object={object} waveShift={waveShift} /> : null}
            {object.kind !== 'road' && object.kind !== 'bridge' && object.kind !== 'water' && object.kind !== 'footpath' ? (
              <Text style={styles.objectLabel}>{object.label}</Text>
            ) : null}
          </View>
        ))}
        <BoatDockLayer />
        <NpcBridgeBoats boatA={npcBoatA} boatB={npcBoatB} />
        <RoadDecorationLayer lightsEnabled={atmosphere.lightsEnabled} glowColor={atmosphere.glowColor} />
        {trafficLights.map((light, index) => (
          <TrafficLight
            key={light.id}
            id={light.id}
            x={light.x}
            y={light.y}
            scale={light.scale}
            activeLight={index % 3 === 0 ? 'red' : index % 3 === 1 ? 'yellow' : 'green'}
            collision={light.collision}
          />
        ))}
        {worldLocations.filter((location) => location.id === 'friendsHouse').map((location) => (
          <FriendsHouseExterior key={location.id} x={location.x} y={location.y} />
        ))}
        {worldLocations.filter((location) => location.id !== 'friendsHouse').map((location) => (
          <LocationTile key={location.id} location={location} caughtByPolice={caughtByPolice} />
        ))}

        {playerMode === 'driving_boat' ? (
          <View style={[styles.boatActor, { transform: [{ translateX: boat.x }, { translateY: boat.y }] }]}>
            <BoatVehicle heading={boat.heading} speed={boat.speed} />
          </View>
        ) : null}

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

        {playerMode === 'walking' ? (
          <>
            <View style={[styles.actor, styles.bossActor, { transform: [{ translateX: boss.x }, { translateY: boss.y }] }]}>
              <View style={[styles.actorShadow, styles.bossActorShadow]} />
              <SpriteCharacter characterId="victorKane" direction={boss.direction} isMoving={boss.isMoving} currentAction={boss.isMoving ? 'walk' : 'idle'} scale={2.25} />
              <Text style={styles.actorLabel}>Boss</Text>
            </View>
            <View style={[styles.actor, styles.playerActor, { transform: [{ translateX: player.x }, { translateY: player.y }] }]}>
              <View style={styles.actorShadow} />
              <SpriteCharacter characterId="lunaCrown" direction={player.direction} isMoving={player.isMoving} currentAction={playerAction} scale={2.4} />
              <Text style={styles.actorLabel}>Luna</Text>
            </View>
          </>
        ) : null}
        <AtmosphereOverlay
          phase={atmosphere.phase}
          overlayColor={atmosphere.overlayColor}
          overlayOpacity={atmosphere.overlayOpacity}
          lightsEnabled={atmosphere.lightsEnabled}
          glowColor={atmosphere.glowColor}
          vignetteOpacity={atmosphere.vignetteOpacity}
        />
      </View>

      <MiniMap player={player} boss={boss} npcs={npcs} footsteps={footsteps} />
      <View pointerEvents="none" style={styles.topLeftInstruction}>
        <Text style={styles.topLeftInstructionTitle} numberOfLines={1}>
          Sin Kingdom World
        </Text>
        <Text style={styles.topLeftInstructionText} numberOfLines={2}>
          {playerMode === 'driving_boat'
            ? message
            : nearbyDock
              ? 'Boating Dock: Enter boat with Boss and drive the long sea.'
              : nearbyLocation
                ? `${nearbyLocation.name}: ${nearbyLocation.interaction}`
                : message}
        </Text>
      </View>
      {__DEV__ ? (
        <View style={styles.atmosphereBadge}>
          <Text style={styles.atmosphereBadgeText}>
            IST {String(atmosphere.hour).padStart(2, '0')}:{String(atmosphere.minute).padStart(2, '0')} | {atmosphere.label}
          </Text>
        </View>
      ) : null}
      {playerMode === 'walking' ? (
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={enterNearbyLocation}>
            <Text style={styles.primaryButtonText}>
              {nearbyDock ? 'ENTER BOAT' : nearbyLocation?.id === 'friendsHouse' ? 'ENTER HOUSE' : nearbyLocation ? 'INTERACT / ENTER' : 'INTERACT'}
            </Text>
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
      ) : (
        <BoatControls speed={boat.speed} fuel={boat.fuel} canExit={Boolean(boatDock)} onBrake={brakeBoat} onExit={exitBoat} />
      )}
      <DPad activeDirections={activeDirections} onDirectionPressIn={pressDirection} onDirectionPressOut={releaseDirection} mode={playerMode === 'driving_boat' ? 'boat' : 'walking'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#08110d',
    overflow: 'hidden',
    direction: 'ltr',
  },
  keyboardInput: {
    position: 'absolute',
    left: -24,
    top: -24,
    width: 1,
    height: 1,
    opacity: 0,
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
    backgroundColor: '#174126',
  },
  worldObject: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  road: {
    zIndex: 8,
    borderWidth: 0,
    borderColor: '#4f5960',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  bridge: {
    zIndex: 12,
    borderWidth: 0,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  bridgeApproachRoad: {
    position: 'absolute',
    borderRadius: 0,
    backgroundColor: '#22272f',
    overflow: 'hidden',
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderColor: '#9f9586',
  },
  bridgeApproachSidewalk: {
    position: 'absolute',
    backgroundColor: '#9f9686',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#d7c697',
  },
  boatDock: {
    position: 'absolute',
    width: 180,
    height: 250,
    zIndex: 6,
  },
  dockPlanks: {
    position: 'absolute',
    left: 56,
    top: 28,
    width: 124,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#8d6f43',
    borderWidth: 4,
    borderColor: '#d5bd79',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  dockPlankLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(72,45,24,0.45)',
  },
  mapBoat: {
    position: 'absolute',
    left: 4,
    top: 78,
    width: 158,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBoatWake: {
    position: 'absolute',
    left: -24,
    width: 82,
    height: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(220,255,255,0.62)',
  },
  mapBoatHull: {
    width: 142,
    height: 66,
    borderRadius: 38,
    backgroundColor: '#f2b632',
    borderWidth: 5,
    borderColor: '#fff0a8',
    shadowColor: '#000',
    shadowOpacity: 0.42,
    shadowRadius: 8,
  },
  mapBoatCabin: {
    position: 'absolute',
    left: 58,
    top: 18,
    width: 28,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#1e8fb5',
    borderWidth: 2,
    borderColor: '#defbff',
  },
  mapBoatSeatLeft: {
    position: 'absolute',
    left: 18,
    top: 10,
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapBoatSeatRight: {
    position: 'absolute',
    right: 15,
    top: 10,
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapBoatWheel: {
    position: 'absolute',
    left: 88,
    top: 20,
    width: 22,
    height: 22,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#2d190c',
    backgroundColor: '#9b671f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBoatWheelHub: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff0ad',
  },
  npcWaterBoat: {
    position: 'absolute',
    width: 96,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  npcBoatWake: {
    position: 'absolute',
    left: -22,
    width: 54,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(232,255,255,0.66)',
  },
  npcBoatHull: {
    width: 82,
    height: 38,
    borderRadius: 24,
    backgroundColor: '#f0b739',
    borderWidth: 4,
    borderColor: '#fff0a8',
    shadowColor: '#00131c',
    shadowOpacity: 0.58,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  npcBoatHullAlt: {
    backgroundColor: '#f0699b',
  },
  npcBoatNose: {
    position: 'absolute',
    right: -9,
    top: 7,
    width: 24,
    height: 24,
    borderRadius: 14,
    backgroundColor: '#ef6d31',
    borderWidth: 3,
    borderColor: '#fff0a8',
  },
  npcBoatSeat: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dockLabel: {
    position: 'absolute',
    left: 10,
    top: 166,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(8,7,12,0.86)',
    borderWidth: 2,
    borderColor: '#ff2e8a',
  },
  dockLabelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  dockHintText: {
    marginTop: 2,
    color: '#ffc334',
    fontSize: 11,
    fontWeight: '900',
  },
  bridgeSceneImage: {
    borderRadius: 18,
  },
  bridgeBoundaryTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 8,
    backgroundColor: 'rgba(199,184,135,0.92)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(64,48,32,0.65)',
  },
  bridgeBoundaryBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 10,
    backgroundColor: 'rgba(36,98,40,0.88)',
    borderTopWidth: 3,
    borderTopColor: 'rgba(210,190,126,0.86)',
  },
  bridgeBoundaryLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(38,112,45,0.86)',
    borderRightWidth: 2,
    borderRightColor: 'rgba(210,190,126,0.78)',
  },
  bridgeBoundaryRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(35,93,43,0.86)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(210,190,126,0.78)',
  },
  roadDashHorizontal: {
    position: 'absolute',
    top: '48%',
    width: 58,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#f5c84c',
  },
  roadDashVertical: {
    position: 'absolute',
    left: '48%',
    width: 6,
    height: 58,
    borderRadius: 4,
    backgroundColor: '#f5c84c',
  },
  roadEdgeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 7,
    height: 3,
    backgroundColor: 'rgba(238,242,231,0.82)',
  },
  roadEdgeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 7,
    height: 3,
    backgroundColor: 'rgba(238,242,231,0.78)',
  },
  roadEdgeLeft: {
    position: 'absolute',
    left: 7,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(238,242,231,0.82)',
  },
  roadEdgeRight: {
    position: 'absolute',
    right: 7,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(238,242,231,0.78)',
  },
  crosswalk: {
    position: 'absolute',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 8,
    zIndex: 4,
  },
  crosswalkStripeHorizontal: {
    width: '86%',
    height: 8,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  crosswalkStripeVertical: {
    width: 8,
    height: '86%',
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  trafficLight: {
    position: 'absolute',
    width: 26,
    height: 54,
    borderRadius: 9,
    backgroundColor: '#07090d',
    borderWidth: 2,
    borderColor: '#4d5668',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 8,
  },
  signalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  signalRed: {
    backgroundColor: '#ff3030',
  },
  signalYellow: {
    backgroundColor: '#ffbd28',
  },
  signalGreen: {
    backgroundColor: '#49e58d',
  },
  streetLamp: {
    position: 'absolute',
    width: 24,
    height: 64,
    alignItems: 'center',
    zIndex: 7,
  },
  lampGlow: {
    width: 30,
    height: 22,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 240, 166, 0.42)',
    borderWidth: 1,
    borderColor: '#fff0a6',
  },
  lampGlowActive: {
    width: 46,
    height: 34,
    borderRadius: 24,
    opacity: 0.92,
    shadowColor: '#ffc75b',
    shadowOpacity: 0.95,
    shadowRadius: 16,
  },
  lampPost: {
    width: 5,
    height: 48,
    backgroundColor: '#d8d0c0',
  },
  roadSign: {
    position: 'absolute',
    width: 94,
    minHeight: 40,
    padding: 5,
    borderRadius: 7,
    backgroundColor: '#102038',
    borderWidth: 2,
    borderColor: '#8ee8ff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 7,
  },
  roadSignText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  footpath: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,222,185,0.44)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  water: {
    zIndex: 1,
    borderWidth: 8,
    borderColor: '#c7bb87',
    borderRadius: 18,
    overflow: 'hidden',
    opacity: 0.98,
    shadowColor: '#001924',
    shadowOpacity: 0.7,
    shadowRadius: 18,
    backgroundColor: '#064f78',
  },
  poolWater: {
    borderWidth: 12,
    borderColor: '#061923',
    borderRadius: 28,
    backgroundColor: '#075b83',
    shadowColor: '#000',
    shadowOpacity: 0.78,
    shadowRadius: 16,
  },
  waterDepthGlow: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: -40,
    bottom: -40,
    backgroundColor: 'rgba(1,30,67,0.34)',
    borderRadius: 60,
  },
  waterCurrentBand: {
    position: 'absolute',
    height: 86,
    borderRadius: 999,
    backgroundColor: 'rgba(101,213,245,0.24)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(235,255,255,0.16)',
  },
  waterRipple: {
    position: 'absolute',
    height: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(222,252,255,0.86)',
    shadowColor: '#dffcff',
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  waterShineLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(248,255,255,0.58)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  waterFoamDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(232,255,255,0.55)',
  },
  waterShoreTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 18,
    backgroundColor: '#bdb48f',
    borderBottomWidth: 4,
    borderBottomColor: '#e8d99a',
  },
  waterShoreBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 18,
    backgroundColor: '#bdb48f',
    borderTopWidth: 4,
    borderTopColor: '#e8d99a',
  },
  waterShoreLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: '#bdb48f',
    borderRightWidth: 4,
    borderRightColor: '#e8d99a',
  },
  waterShoreRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: '#bdb48f',
    borderLeftWidth: 4,
    borderLeftColor: '#e8d99a',
  },
  waterCornerStone: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#9e9277',
    borderWidth: 4,
    borderColor: '#efe0a8',
  },
  waterCornerTopLeft: {
    left: 4,
    top: 4,
  },
  waterCornerTopRight: {
    right: 4,
    top: 4,
  },
  waterCornerBottomLeft: {
    left: 4,
    bottom: 4,
  },
  waterCornerBottomRight: {
    right: 4,
    bottom: 4,
  },
  lilyPad: {
    position: 'absolute',
    width: 30,
    height: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(80,158,70,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(151,213,99,0.58)',
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
  boatActor: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 45,
  },
  playerActor: {
    zIndex: 160,
    elevation: 160,
  },
  bossActor: {
    zIndex: 155,
    elevation: 155,
  },
  actorShadow: {
    position: 'absolute',
    left: 9,
    top: 57,
    width: 58,
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    zIndex: -1,
  },
  bossActorShadow: {
    left: 7,
    top: 53,
  },
  actorLabel: {
    marginTop: -4,
    color: '#fff7d7',
    fontSize: 9,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 3,
  },
  topLeftInstruction: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 158,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(4, 4, 10, 0.82)',
    borderWidth: 1,
    borderColor: '#ff2e8a',
    zIndex: 950,
    elevation: 950,
  },
  topLeftInstructionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  topLeftInstructionText: {
    marginTop: 3,
    color: '#f3d9ff',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
  },
  atmosphereBadge: {
    position: 'absolute',
    left: 16,
    top: 114,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 9, 18, 0.76)',
    borderWidth: 1,
    borderColor: '#ffbf3f',
    shadowColor: '#ff2e8a',
    shadowOpacity: 0.42,
    shadowRadius: 8,
    zIndex: 60,
  },
  atmosphereBadgeText: {
    color: '#fff2c9',
    fontSize: 11,
    fontWeight: '900',
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
