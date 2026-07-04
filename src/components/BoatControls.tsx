import { Pressable, StyleSheet, Text, View } from 'react-native';

type BoatControlsProps = {
  speed: number;
  fuel: number;
  canExit: boolean;
  onBrake: () => void;
  onExit: () => void;
};

export default function BoatControls({ speed, fuel, canExit, onBrake, onExit }: BoatControlsProps) {
  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.speedometer}>
          <Text style={styles.speedNumber}>{Math.round(speed)}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.statTitle}>BOAT DRIVE</Text>
          <Text style={styles.stat}>FUEL {Math.round(fuel)}%</Text>
          <Text style={styles.stat}>FRONT / BACK + LEFT / RIGHT</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={onBrake}>
          <Text style={styles.buttonText}>BRAKE</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.exitButton, !canExit && styles.disabledButton]} onPress={onExit} disabled={!canExit}>
          <Text style={[styles.buttonText, !canExit && styles.disabledText]}>{canExit ? 'EXIT BOAT' : 'FIND DOCK'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 300,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(4, 7, 16, 0.86)',
    borderWidth: 2,
    borderColor: '#ffc334',
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 9,
  },
  speedometer: {
    width: 68,
    height: 68,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#8ff0ff',
    backgroundColor: '#06101c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedNumber: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
  },
  speedUnit: {
    color: '#8ff0ff',
    fontSize: 9,
    fontWeight: '900',
  },
  stats: {
    flex: 1,
  },
  statTitle: {
    color: '#ffc334',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  stat: {
    color: '#8ff0ff',
    fontSize: 11,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: '#170716',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButton: {
    backgroundColor: '#ffc334',
    borderColor: '#fff1ae',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  disabledText: {
    color: '#d4c9a6',
  },
});
