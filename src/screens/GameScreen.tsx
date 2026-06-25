import { useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import DPad from '../components/DPad';
import { Direction, GameBounds } from '../game/types';
import { useGameLoop } from '../game/useGameLoop';

const FRAME_SIZE = 32;
const SHEET_SIZE = 128;

const directionToRow = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
} as const;

function Sprite({ direction, frame }: { direction: Direction; frame: number }) {
  const row = directionToRow[direction];
  const offsetX = -frame * FRAME_SIZE;
  const offsetY = -row * FRAME_SIZE;

  return (
    <View style={styles.spriteViewport}>
      <Image
        source={require('../../assets/player/player.png')}
        style={{
          width: SHEET_SIZE,
          height: SHEET_SIZE,
          position: 'absolute',
          left: offsetX,
          top: offsetY,
        }}
      />
    </View>
  );
}

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const stageWidth = Math.min(width, (height * 9) / 16);
  const [bounds, setBounds] = useState<GameBounds>({ width: 0, height: 0 });
  const [activeDirections, setActiveDirections] = useState<Direction[]>([]);
  const player = useGameLoop(activeDirections, bounds);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds({ width, height });
  };

  const pressDirection = (direction: Direction) => {
    setActiveDirections((current) => (current.includes(direction) ? current : [...current, direction]));
  };

  const releaseDirection = (direction: Direction) => {
    setActiveDirections((current) => current.filter((item) => item !== direction));
  };

  return (
    <View style={styles.appRoot}>
      <View style={[styles.root, { width: stageWidth }]} onLayout={handleLayout}>
        <View style={styles.gridOverlay} pointerEvents="none" />

        <View
          style={[
            styles.player,
            {
              transform: [{ translateX: player.x }, { translateY: player.y }],
            },
          ]}
        >
          <Sprite direction={player.direction} frame={player.animationFrame} />
        </View>

        <View style={styles.debugPanel} pointerEvents="none">
          <Text style={styles.debugTitle}>Player Debug</Text>
          <Text style={styles.debugText}>direction: {player.direction}</Text>
          <Text style={styles.debugText}>isMoving: {String(player.isMoving)}</Text>
          <Text style={styles.debugText}>animationFrame: {player.animationFrame}</Text>
          <Text style={styles.debugText}>x: {player.x.toFixed(1)}</Text>
          <Text style={styles.debugText}>y: {player.y.toFixed(1)}</Text>
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
  gridOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.18,
    backgroundColor: '#1b2030',
  },
  player: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  spriteViewport: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },
  debugPanel: {
    position: 'absolute',
    top: 54,
    left: 16,
    padding: 12,
    minWidth: 205,
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
