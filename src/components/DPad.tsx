import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Direction } from '../game/types';

type DPadProps = {
  activeDirections: Direction[];
  onDirectionPressIn: (direction: Direction) => void;
  onDirectionPressOut: (direction: Direction) => void;
  mode?: 'walking' | 'boat';
};

export default function DPad({ activeDirections, onDirectionPressIn, onDirectionPressOut, mode = 'walking' }: DPadProps) {
  const buttons: Array<{ direction: Direction; label: string; style: object }> = [
    { direction: 'up', label: mode === 'boat' ? 'FRONT' : 'UP', style: styles.up },
    { direction: 'left', label: 'LEFT', style: styles.left },
    { direction: 'right', label: 'RIGHT', style: styles.right },
    { direction: 'down', label: mode === 'boat' ? 'BACK' : 'DOWN', style: styles.down },
  ];

  return (
    <View style={styles.root}>
      {buttons.map((button) => {
        const active = activeDirections.includes(button.direction);
        return (
          <Pressable
            key={button.direction}
            onPressIn={() => onDirectionPressIn(button.direction)}
            onPressOut={() => onDirectionPressOut(button.direction)}
            style={[styles.button, button.style, active && styles.buttonActive]}
          >
            <Text style={styles.buttonText}>{button.label}</Text>
          </Pressable>
        );
      })}
      <View pointerEvents="none" style={styles.center} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 24,
    bottom: 28,
    width: 174,
    height: 174,
  },
  button: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(25, 25, 34, 0.92)',
    borderWidth: 2,
    borderColor: '#6f7587',
  },
  buttonActive: {
    backgroundColor: '#314cff',
    borderColor: '#dce4ff',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  up: {
    top: 0,
    left: 55,
  },
  left: {
    top: 55,
    left: 0,
  },
  right: {
    top: 55,
    right: 0,
  },
  down: {
    bottom: 0,
    left: 55,
  },
  center: {
    position: 'absolute',
    top: 67,
    left: 67,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
});
