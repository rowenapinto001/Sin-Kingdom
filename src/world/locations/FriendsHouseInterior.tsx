import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import DialogBox from '../../components/DialogBox';
import DPad from '../../components/DPad';
import InteractZone from '../../components/InteractZone';
import SpriteCharacter from '../../components/SpriteCharacter';
import { friendsHouseCollisionBoxes, friendsHouseInteractZones, friendsHouseInterior, friendsHouseRooms } from '../../data/friendsHouseConfig';
import { friendsHouseDialogue } from '../../data/dialogues/friendsHouseDialogue';
import { Direction } from '../../game/types';
import { Rect } from '../worldTypes';

type Actor = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
};

type FriendsHouseInteriorProps = {
  onExit: () => void;
  onMissionStart: () => void;
};

const PLAYER_SIZE = 46;
const SPEED = 185;

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

function isBlocked(rect: Rect) {
  return friendsHouseCollisionBoxes.some((box) => rectsOverlap(rect, box));
}

function nearbyZone(actor: Actor) {
  const actorRect = { x: actor.x - 18, y: actor.y - 18, width: PLAYER_SIZE + 36, height: PLAYER_SIZE + 36 };
  return friendsHouseInteractZones.find((zone) => rectsOverlap(actorRect, zone));
}

function Furniture() {
  return (
    <>
      <View style={[styles.bed, { left: 150, top: 138 }]} />
      <View style={[styles.wardrobe, { left: 340, top: 112 }]} />
      <View style={[styles.poolTable, { left: 625, top: 154 }]}>
        <View style={styles.poolFelt} />
      </View>
      <View style={[styles.desk, { left: 1115, top: 138 }]}>
        <View style={styles.laptop} />
      </View>
      <View style={[styles.bookshelf, { left: 1370, top: 108 }]} />
      <View style={[styles.staircase, { left: 160, top: 480 }]}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={[styles.step, { top: 10 + index * 26 }]} />
        ))}
      </View>
      <View style={[styles.rug, { left: 650, top: 520 }]} />
      <View style={[styles.sofa, { left: 585, top: 615 }]} />
      <View style={[styles.sofa, styles.sofaRight, { left: 930, top: 500 }]} />
      <View style={[styles.table, { left: 755, top: 590 }]} />
      <View style={[styles.kitchenCounter, { left: 1160, top: 504 }]} />
      <View style={[styles.kitchenIsland, { left: 1290, top: 626 }]} />
      <View style={[styles.bathFixture, { left: 1185, top: 806 }]} />
      <View style={[styles.bathTub, { left: 1310, top: 800 }]} />
      {[
        { x: 472, y: 360 },
        { x: 1090, y: 360 },
        { x: 92, y: 734 },
        { x: 1456, y: 430 },
      ].map((lamp, index) => (
        <View key={index} style={[styles.lamp, { left: lamp.x, top: lamp.y }]}>
          <View style={styles.lampGlow} />
        </View>
      ))}
    </>
  );
}

export default function FriendsHouseInterior({ onExit, onMissionStart }: FriendsHouseInteriorProps) {
  const { width, height } = useWindowDimensions();
  const [activeDirections, setActiveDirections] = useState<Direction[]>([]);
  const activeDirectionsRef = useRef<Direction[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const [dialog, setDialog] = useState<'arion' | 'boss' | 'bossDetails' | 'missionUnlocked' | 'laptop' | null>(null);
  const [missionUnlocked, setMissionUnlocked] = useState(false);
  const [player, setPlayer] = useState<Actor>({ x: friendsHouseInterior.playerSpawn.x, y: friendsHouseInterior.playerSpawn.y, direction: 'up', isMoving: false });
  const playerRef = useRef(player);
  const [boss, setBoss] = useState<Actor>({ x: friendsHouseInterior.bossMeetingSpot.x, y: friendsHouseInterior.bossMeetingSpot.y, direction: 'down', isMoving: false });
  const bossRef = useRef(boss);
  const zone = useMemo(() => nearbyZone(player), [player]);
  const cameraX = clamp(width / 2 - player.x, width - friendsHouseInterior.width, 0);
  const cameraY = clamp(height / 2 - player.y, height - friendsHouseInterior.height, 0);

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
        x: clamp(current.x + vector.dx * SPEED * deltaSeconds, 48, friendsHouseInterior.width - PLAYER_SIZE - 48),
        y: clamp(current.y + vector.dy * SPEED * deltaSeconds, 48, friendsHouseInterior.height - PLAYER_SIZE - 30),
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
      };
      const nextPlayer = isMoving && !isBlocked(candidate)
        ? { x: candidate.x, y: candidate.y, direction, isMoving: true }
        : { ...current, direction, isMoving: false };
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

      const currentBoss = bossRef.current;
      const bossSitsForMeeting = nextPlayer.y < 570;
      const target = bossSitsForMeeting ? friendsHouseInterior.bossMeetingSpot : { x: nextPlayer.x - 58, y: nextPlayer.y + 48 };
      const dx = target.x - currentBoss.x;
      const dy = target.y - currentBoss.y;
      const distance = Math.hypot(dx, dy);
      const step = distance > 10 ? Math.min(distance, 130 * deltaSeconds) / distance : 0;
      const bossCandidate = {
        x: currentBoss.x + dx * step,
        y: currentBoss.y + dy * step,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
      };
      const nextBoss = step > 0 && !isBlocked(bossCandidate)
        ? { x: bossCandidate.x, y: bossCandidate.y, direction: directionFromVector(dx, dy, currentBoss.direction), isMoving: true }
        : { ...currentBoss, isMoving: false };
      bossRef.current = nextBoss;
      setBoss(nextBoss);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTimestampRef.current = null;
    };
  }, []);

  const interact = () => {
    if (!zone) return;
    if (zone.id === 'exit') {
      onExit();
      return;
    }
    setDialog(zone.id);
  };

  const unlockMission = () => {
    setMissionUnlocked(true);
    setDialog('missionUnlocked');
  };

  return (
    <View style={styles.root}>
      <View style={[styles.house, { transform: [{ translateX: cameraX }, { translateY: cameraY }] }]}>
        {friendsHouseRooms.map((room) => (
          <View key={room.id} style={[styles.room, { left: room.x, top: room.y, width: room.width, height: room.height, backgroundColor: room.floor }]}>
            <View style={styles.roomGlow} />
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={[styles.floorLine, { top: 28 + index * 42 }]} />
            ))}
          </View>
        ))}
        <View style={styles.outerWall} />
        <View style={styles.hallLineHorizontal} />
        <View style={styles.hallLineVertical} />
        <Furniture />
        {friendsHouseInteractZones.map((item) => (
          <InteractZone
            key={item.id}
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            label={item.label}
            active={zone?.id === item.id}
            onPress={() => setDialog(item.id === 'exit' ? null : item.id)}
          />
        ))}
        <View style={[styles.actor, { transform: [{ translateX: friendsHouseInterior.arionSpot.x }, { translateY: friendsHouseInterior.arionSpot.y }] }]}>
          <SpriteCharacter characterId="friend" direction="down" isMoving={false} currentAction="idle" scale={1.85} />
          <Text style={styles.actorLabel}>Arion Vale</Text>
        </View>
        <View style={[styles.actor, { transform: [{ translateX: boss.x }, { translateY: boss.y }] }]}>
          <SpriteCharacter characterId="victorKane" direction={boss.direction} isMoving={boss.isMoving} currentAction={boss.isMoving ? 'walk' : 'idle'} scale={1.9} />
          <Text style={styles.actorLabel}>Boss</Text>
        </View>
        <View style={[styles.actor, { transform: [{ translateX: player.x }, { translateY: player.y }] }]}>
          <SpriteCharacter characterId="lunaCrown" direction={player.direction} isMoving={player.isMoving} currentAction={player.isMoving ? 'walk' : 'idle'} scale={2} />
          <Text style={styles.actorLabel}>Luna</Text>
        </View>
      </View>

      <View style={styles.hud}>
        <Text style={styles.title}>Friends House</Text>
        <Text style={styles.subtitle}>{zone ? zone.label : 'Walk through rooms. Meet Arion Vale and the Boss in the living room.'}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={interact}>
          <Text style={styles.primaryButtonText}>{zone ? zone.label : 'INTERACT'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onExit}>
          <Text style={styles.secondaryButtonText}>EXIT HOUSE</Text>
        </Pressable>
      </View>
      <DPad activeDirections={activeDirections} onDirectionPressIn={(direction) => setActiveDirections((current) => current.includes(direction) ? current : [...current, direction])} onDirectionPressOut={(direction) => setActiveDirections((current) => current.filter((item) => item !== direction))} />

      {dialog === 'arion' ? (
        <DialogBox title="Arion Vale" text={friendsHouseDialogue.arionGreeting} onClose={() => setDialog(null)} />
      ) : null}
      {dialog === 'boss' ? (
        <DialogBox
          title="Boss Meeting"
          text={friendsHouseDialogue.bossIntro}
          choices={[
            { label: "I'm ready.", onPress: unlockMission },
            { label: 'Tell me more.', onPress: () => setDialog('bossDetails') },
            { label: 'Not right now.', onPress: () => setDialog(null) },
          ]}
        />
      ) : null}
      {dialog === 'bossDetails' ? (
        <DialogBox title="Private Matter" text={friendsHouseDialogue.bossDetails} choices={[{ label: "I'm ready.", onPress: unlockMission }]} onClose={() => setDialog(null)} />
      ) : null}
      {dialog === 'missionUnlocked' ? (
        <DialogBox
          title={friendsHouseDialogue.missionUnlocked}
          text={`${friendsHouseDialogue.missionTitle}\n${friendsHouseDialogue.reward}`}
          choices={[{ label: 'Start Mission', onPress: onMissionStart }]}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'laptop' ? (
        <DialogBox title="Study Laptop" text={missionUnlocked ? 'Private Matter is active in your mission list.' : 'Mission files are encrypted. Talk to the Boss first.'} onClose={() => setDialog(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090710',
    overflow: 'hidden',
  },
  house: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: friendsHouseInterior.width,
    height: friendsHouseInterior.height,
    backgroundColor: '#15121b',
  },
  outerWall: {
    position: 'absolute',
    left: 48,
    top: 48,
    width: 1504,
    height: 924,
    borderWidth: 12,
    borderColor: '#8b785d',
    borderRadius: 18,
  },
  room: {
    position: 'absolute',
    borderWidth: 5,
    borderColor: '#a89269',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  roomGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,205,112,0.07)',
  },
  floorLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  hallLineHorizontal: {
    position: 'absolute',
    left: 440,
    top: 360,
    width: 680,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#272330',
    borderWidth: 4,
    borderColor: '#8b785d',
  },
  hallLineVertical: {
    position: 'absolute',
    left: 725,
    top: 480,
    width: 150,
    height: 400,
    borderRadius: 18,
    backgroundColor: '#272330',
    borderWidth: 4,
    borderColor: '#8b785d',
  },
  actor: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  actorLabel: {
    marginTop: -5,
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  hud: {
    position: 'absolute',
    left: 18,
    top: 18,
    maxWidth: 360,
    padding: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(7, 5, 13, 0.88)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: '#f7d9ff',
    fontSize: 12,
    fontWeight: '800',
  },
  actions: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffe08b',
    backgroundColor: '#ffc334',
  },
  primaryButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryButton: {
    minWidth: 140,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(10, 8, 18, 0.92)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  bed: {
    position: 'absolute',
    width: 150,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#6b4e7e',
    borderWidth: 4,
    borderColor: '#d8bf91',
  },
  wardrobe: {
    position: 'absolute',
    width: 42,
    height: 130,
    borderRadius: 8,
    backgroundColor: '#5d3d28',
  },
  poolTable: {
    position: 'absolute',
    width: 180,
    height: 82,
    borderRadius: 18,
    backgroundColor: '#5c3627',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolFelt: {
    width: 148,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1f8d65',
  },
  desk: {
    position: 'absolute',
    width: 150,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#7c5434',
  },
  laptop: {
    position: 'absolute',
    left: 50,
    top: 12,
    width: 52,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#8df4ff',
  },
  bookshelf: {
    position: 'absolute',
    width: 42,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#6d452c',
  },
  staircase: {
    position: 'absolute',
    width: 112,
    height: 176,
    borderRadius: 12,
    backgroundColor: '#615b68',
  },
  step: {
    position: 'absolute',
    left: 12,
    width: 88,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d8c896',
  },
  rug: {
    position: 'absolute',
    width: 250,
    height: 120,
    borderRadius: 28,
    backgroundColor: '#7c1f58',
    borderWidth: 5,
    borderColor: '#e7b7ff',
  },
  sofa: {
    position: 'absolute',
    width: 140,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#20202b',
    borderWidth: 3,
    borderColor: '#bd9e74',
  },
  sofaRight: {
    width: 52,
    height: 130,
  },
  table: {
    position: 'absolute',
    width: 92,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#c0914d',
  },
  kitchenCounter: {
    position: 'absolute',
    width: 180,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#ced5d8',
  },
  kitchenIsland: {
    position: 'absolute',
    width: 92,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#aab5ba',
  },
  bathFixture: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d8f2ff',
  },
  bathTub: {
    position: 'absolute',
    width: 70,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#d8f2ff',
  },
  lamp: {
    position: 'absolute',
    width: 26,
    height: 52,
    alignItems: 'center',
  },
  lampGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 198, 87, 0.28)',
  },
});
