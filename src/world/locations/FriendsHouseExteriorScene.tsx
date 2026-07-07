import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import DialogBox from '../../components/DialogBox';
import DPad from '../../components/DPad';
import InteractZone from '../../components/InteractZone';
import SceneBackground from '../../components/SceneBackground';
import SpriteCharacter from '../../components/SpriteCharacter';
import {
  FriendsHouseExteriorInteractId,
  friendsHouseExteriorBlockedZones,
  friendsHouseExteriorInteractZones,
  friendsHouseExteriorScene,
  friendsHouseExteriorWalkZones,
} from '../../data/friendsHouseExteriorSceneConfig';
import { Direction } from '../../game/types';
import { Rect } from '../worldTypes';

type Actor = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
};

type FriendsHouseExteriorSceneProps = {
  onEnterHouse: () => void;
  onExitWorld: () => void;
};

const backgroundImage = require('../../../assets/locations/friends_house/friends_house_front.png');
const PLAYER_WIDTH = 62;
const PLAYER_HEIGHT = 94;
const SPEED = 210;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pointInRect(point: { x: number; y: number }, rect: Rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
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

function canStandAt(rect: Rect) {
  const footPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height };
  const inWalkZone = friendsHouseExteriorWalkZones.some((zone) => pointInRect(footPoint, zone));
  const blocked = friendsHouseExteriorBlockedZones.some((zone) => rectsOverlap(rect, zone));
  return inWalkZone && !blocked;
}

function nearbyZone(actor: Actor) {
  const actorRect = { x: actor.x - 24, y: actor.y - 24, width: PLAYER_WIDTH + 48, height: PLAYER_HEIGHT + 48 };
  return friendsHouseExteriorInteractZones.find((zone) => rectsOverlap(actorRect, zone));
}

export default function FriendsHouseExteriorScene({ onEnterHouse, onExitWorld }: FriendsHouseExteriorSceneProps) {
  const { width, height } = useWindowDimensions();
  const scaleX = width / friendsHouseExteriorScene.width;
  const scaleY = height / friendsHouseExteriorScene.height;
  const [activeDirections, setActiveDirections] = useState<Direction[]>([]);
  const activeDirectionsRef = useRef<Direction[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const keyboardReleaseTimersRef = useRef<Partial<Record<Direction, ReturnType<typeof setTimeout>>>>({});
  const [dialog, setDialog] = useState<FriendsHouseExteriorInteractId | null>(null);
  const [player, setPlayer] = useState<Actor>({ ...friendsHouseExteriorScene.playerSpawn, direction: 'up', isMoving: false });
  const playerRef = useRef(player);
  const [boss, setBoss] = useState<Actor>({ ...friendsHouseExteriorScene.bossSpawn, direction: 'up', isMoving: false });
  const bossRef = useRef(boss);
  const zone = useMemo(() => nearbyZone(player), [player]);

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
      const candidate = {
        x: clamp(current.x + vector.dx * SPEED * deltaSeconds, 0, friendsHouseExteriorScene.width - PLAYER_WIDTH),
        y: clamp(current.y + vector.dy * SPEED * deltaSeconds, 0, friendsHouseExteriorScene.height - PLAYER_HEIGHT),
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
      };
      const nextPlayer = isMoving && canStandAt(candidate)
        ? { x: candidate.x, y: candidate.y, direction, isMoving: true }
        : { ...current, direction, isMoving: false };
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

      const currentBoss = bossRef.current;
      const target = { x: nextPlayer.x - 66, y: nextPlayer.y + 18 };
      const dx = target.x - currentBoss.x;
      const dy = target.y - currentBoss.y;
      const distance = Math.hypot(dx, dy);
      const step = distance > 20 ? Math.min(distance, 150 * deltaSeconds) / distance : 0;
      const bossCandidate = {
        x: clamp(currentBoss.x + dx * step, 0, friendsHouseExteriorScene.width - PLAYER_WIDTH),
        y: clamp(currentBoss.y + dy * step, 0, friendsHouseExteriorScene.height - PLAYER_HEIGHT),
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
      };
      const nextBoss = step > 0 && canStandAt(bossCandidate)
        ? { x: bossCandidate.x, y: bossCandidate.y, direction: directionFromVector(dx, dy, currentBoss.direction), isMoving: true }
        : { ...currentBoss, isMoving: false };
      bossRef.current = nextBoss;
      setBoss(nextBoss);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      Object.values(keyboardReleaseTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      lastTimestampRef.current = null;
    };
  }, []);

  const pressDirection = (direction: Direction) => {
    setActiveDirections((current) => (current.includes(direction) ? current : [...current, direction]));
  };

  const releaseDirection = (direction: Direction) => {
    setActiveDirections((current) => current.filter((item) => item !== direction));
  };

  const pulseKeyboardDirection = (direction: Direction) => {
    pressDirection(direction);
    const existingTimer = keyboardReleaseTimersRef.current[direction];
    if (existingTimer) clearTimeout(existingTimer);
    keyboardReleaseTimersRef.current[direction] = setTimeout(() => {
      releaseDirection(direction);
      delete keyboardReleaseTimersRef.current[direction];
    }, 150);
  };

  const handleKeyboardMove = (key: string) => {
    const directionByKey: Record<string, Direction | undefined> = {
      ArrowUp: 'up',
      w: 'up',
      W: 'up',
      ArrowDown: 'down',
      s: 'down',
      S: 'down',
      ArrowLeft: 'left',
      a: 'left',
      A: 'left',
      ArrowRight: 'right',
      d: 'right',
      D: 'right',
    };
    const direction = directionByKey[key];
    if (direction) pulseKeyboardDirection(direction);
  };

  const interact = () => {
    if (!zone) return;
    if (zone.id === 'enterHouse' || zone.id === 'talkArion') {
      onEnterHouse();
      return;
    }
    setDialog(zone.id);
  };

  const scenePoint = (x: number, y: number) => ({ left: x * scaleX, top: y * scaleY });

  return (
    <View style={styles.root}>
      <TextInput
        autoFocus
        caretHidden
        showSoftInputOnFocus={false}
        value=""
        onKeyPress={({ nativeEvent }) => handleKeyboardMove(nativeEvent.key)}
        style={styles.keyboardInput}
      />
      <SceneBackground source={backgroundImage} width={width} height={height}>
        {friendsHouseExteriorInteractZones.map((item) => (
          <InteractZone
            key={item.id}
            x={item.x * scaleX}
            y={item.y * scaleY}
            width={item.width * scaleX}
            height={item.height * scaleY}
            label={item.label}
            active={zone?.id === item.id}
            onPress={item.id === 'enterHouse' || item.id === 'talkArion' ? onEnterHouse : () => setDialog(item.id)}
          />
        ))}
        <View style={[styles.actor, scenePoint(friendsHouseExteriorScene.arionSpawn.x, friendsHouseExteriorScene.arionSpawn.y)]}>
          <SpriteCharacter characterId="friend" direction="down" isMoving={false} currentAction="idle" scale={1.65} />
          <Text style={styles.actorLabel}>Arion Vale</Text>
        </View>
        <View style={[styles.actor, scenePoint(boss.x, boss.y)]}>
          <SpriteCharacter characterId="victorKane" direction={boss.direction} isMoving={boss.isMoving} currentAction={boss.isMoving ? 'walk' : 'idle'} scale={1.55} />
          <Text style={styles.actorLabel}>Boss</Text>
        </View>
        <View style={[styles.actor, scenePoint(player.x, player.y)]}>
          <SpriteCharacter characterId="lunaCrown" direction={player.direction} isMoving={player.isMoving} currentAction={player.isMoving ? 'walk' : 'idle'} scale={1.7} />
          <Text style={styles.actorLabel}>Luna</Text>
        </View>
      </SceneBackground>

      <View style={styles.hud}>
        <Text style={styles.title}>Friends House</Text>
        <Text style={styles.subtitle}>{zone ? zone.label : 'Meet Arion Vale. Enter the mansion.'}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={interact}>
          <Text style={styles.primaryButtonText}>{zone ? zone.label : 'INTERACT'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onExitWorld}>
          <Text style={styles.secondaryButtonText}>EXIT TO WORLD</Text>
        </Pressable>
      </View>
      <DPad activeDirections={activeDirections} onDirectionPressIn={pressDirection} onDirectionPressOut={releaseDirection} />

      {dialog === 'talkArion' ? (
        <DialogBox title="Arion Vale" text="Hey! You made it. Come in, the boss is inside." onClose={() => setDialog(null)} />
      ) : null}
      {dialog === 'talkBoss' ? (
        <DialogBox title="Boss" text="The meeting is inside. Let's go." onClose={() => setDialog(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#06070c',
    overflow: 'hidden',
  },
  keyboardInput: {
    position: 'absolute',
    left: -24,
    top: -24,
    width: 1,
    height: 1,
    opacity: 0,
  },
  actor: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
  },
  actorLabel: {
    marginTop: -4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  hud: {
    position: 'absolute',
    left: 16,
    top: 14,
    maxWidth: 380,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(5,8,16,0.72)',
    borderWidth: 2,
    borderColor: '#ff2e8a',
  },
  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: '#f7d5ff',
    fontSize: 13,
    fontWeight: '800',
  },
  actions: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    minWidth: 164,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#ffc334',
    borderWidth: 3,
    borderColor: '#fff0a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#090912',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    minWidth: 154,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(4,7,16,0.82)',
    borderWidth: 2,
    borderColor: '#ff2e8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
});
