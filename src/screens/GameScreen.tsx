import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import AnimatedCharacter from '../components/AnimatedCharacter';
import DPad from '../components/DPad';
import { allCharacterConfigs, getCharacterConfig } from '../data/characterConfigs';
import { gameSettings } from '../data/gameSettings';
import { CharacterId, Direction, GameBounds } from '../game/types';
import { useGameLoop } from '../game/useGameLoop';
import { mergeDirectionInputs, useKeyboardControls } from '../hooks/useKeyboardControls';

type NpcActor = {
  id: string;
  characterId: CharacterId;
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: Direction;
};

const npcSeeds: NpcActor[] = [
  { id: 'police-1', characterId: 'police', x: 42, y: 88, dx: 1, dy: 0, direction: 'right' },
  { id: 'guard-1', characterId: 'securityGuard1', x: 260, y: 126, dx: -1, dy: 0, direction: 'left' },
  { id: 'civilian-1', characterId: 'npcWoman', x: 96, y: 280, dx: 0, dy: 1, direction: 'down' },
  { id: 'civilian-2', characterId: 'npcMan', x: 310, y: 330, dx: 0, dy: -1, direction: 'up' },
  { id: 'boss-1', characterId: 'victorKane', x: 410, y: 192, dx: -0.6, dy: 0, direction: 'left' },
  { id: 'bodyguard-1', characterId: 'zaraFlame', x: 180, y: 410, dx: 0.7, dy: 0, direction: 'right' },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function directionFromVector(dx: number, dy: number, fallback: Direction): Direction {
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const stageWidth = Math.min(width, (height * 9) / 16);
  const [bounds, setBounds] = useState<GameBounds>({ width: 0, height: 0 });
  const [touchDirections, setTouchDirections] = useState<Direction[]>([]);
  const keyboardControls = useKeyboardControls({
    enabled: gameSettings.keyboardControlsEnabled,
  });
  const activeDirections = useMemo(
    () => mergeDirectionInputs(touchDirections, keyboardControls.activeDirections),
    [keyboardControls.activeDirections, touchDirections],
  );
  const [npcActors, setNpcActors] = useState<NpcActor[]>(npcSeeds);
  const npcActorsRef = useRef(npcSeeds);
  const npcTickRef = useRef<number | null>(null);
  const npcLastTimestampRef = useRef<number | null>(null);
  const player = useGameLoop(activeDirections, bounds);
  const playerConfig = getCharacterConfig(player.characterId);

  const configuredCharacterCount = useMemo(() => allCharacterConfigs.length, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds({ width, height });
  };

  const pressDirection = (direction: Direction) => {
    setTouchDirections((current) => (current.includes(direction) ? current : [...current, direction]));
  };

  const releaseDirection = (direction: Direction) => {
    setTouchDirections((current) => current.filter((item) => item !== direction));
  };

  useEffect(() => {
    if (bounds.width <= 0 || bounds.height <= 0) return undefined;

    const tick = (timestamp: number) => {
      if (npcLastTimestampRef.current === null) {
        npcLastTimestampRef.current = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - npcLastTimestampRef.current) / 1000, 0.05);
      npcLastTimestampRef.current = timestamp;

      npcActorsRef.current = npcActorsRef.current.map((actor) => {
        const config = getCharacterConfig(actor.characterId);
        const actorWidth = config.sheet.frameWidth * config.scale;
        const actorHeight = config.sheet.frameHeight * config.scale;
        const maxX = Math.max(0, bounds.width - actorWidth);
        const maxY = Math.max(0, bounds.height - actorHeight);
        let nextDx = actor.dx;
        let nextDy = actor.dy;
        let nextX = actor.x + actor.dx * config.speed * deltaSeconds * 0.55;
        let nextY = actor.y + actor.dy * config.speed * deltaSeconds * 0.55;

        if (nextX <= 0 || nextX >= maxX) {
          nextDx *= -1;
          nextX = clamp(nextX, 0, maxX);
        }

        if (nextY <= 0 || nextY >= maxY) {
          nextDy *= -1;
          nextY = clamp(nextY, 0, maxY);
        }

        return {
          ...actor,
          x: nextX,
          y: nextY,
          dx: nextDx,
          dy: nextDy,
          direction: directionFromVector(nextDx, nextDy, actor.direction),
        };
      });

      setNpcActors(npcActorsRef.current);
      npcTickRef.current = requestAnimationFrame(tick);
    };

    npcTickRef.current = requestAnimationFrame(tick);

    return () => {
      if (npcTickRef.current !== null) {
        cancelAnimationFrame(npcTickRef.current);
      }
      npcLastTimestampRef.current = null;
    };
  }, [bounds.height, bounds.width]);

  return (
    <View style={styles.appRoot}>
      <View style={[styles.root, { width: stageWidth }]} onLayout={handleLayout}>
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
        <View style={styles.gridOverlay} pointerEvents="none" />
        <View style={styles.floorGlow} pointerEvents="none" />

        {npcActors.map((actor) => (
          <View
            key={actor.id}
            style={[
              styles.actor,
              {
                transform: [{ translateX: actor.x }, { translateY: actor.y }],
              },
            ]}
          >
            <AnimatedCharacter characterId={actor.characterId} direction={actor.direction} isMoving />
          </View>
        ))}

        <View
          style={[
            styles.player,
            {
              width: playerConfig.sheet.frameWidth * playerConfig.scale,
              height: playerConfig.sheet.frameHeight * playerConfig.scale,
              transform: [{ translateX: player.x }, { translateY: player.y }],
            },
          ]}
        >
          <AnimatedCharacter
            characterId={player.characterId}
            direction={player.direction}
            isMoving={player.isMoving}
            frameOverride={player.animationFrame}
          />
        </View>

        <View style={styles.debugPanel} pointerEvents="none">
          <Text style={styles.debugTitle}>Animation Debug</Text>
          <Text style={styles.debugText}>character: {playerConfig.name}</Text>
          <Text style={styles.debugText}>direction: {player.direction}</Text>
          <Text style={styles.debugText}>isMoving: {String(player.isMoving)}</Text>
          <Text style={styles.debugText}>animationFrame: {player.animationFrame}</Text>
          <Text style={styles.debugText}>x: {player.x.toFixed(1)}</Text>
          <Text style={styles.debugText}>y: {player.y.toFixed(1)}</Text>
          <Text style={styles.debugText}>configured characters: {configuredCharacterCount}</Text>
        </View>

        <DPad activeDirections={activeDirections} onDirectionPressIn={pressDirection} onDirectionPressOut={releaseDirection} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#11131a',
  },
  root: {
    flex: 1,
    maxWidth: '100%',
    backgroundColor: '#11131a',
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
  gridOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.18,
    backgroundColor: '#1b2030',
  },
  floorGlow: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    bottom: '18%',
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 46, 129, 0.12)',
  },
  actor: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  player: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  debugPanel: {
    position: 'absolute',
    top: 54,
    left: 16,
    padding: 12,
    minWidth: 235,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderWidth: 1,
    borderColor: '#6c7cff',
  },
  debugTitle: {
    marginBottom: 6,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  debugText: {
    color: '#dfe5ff',
    fontSize: 13,
    fontWeight: '700',
  },
});
