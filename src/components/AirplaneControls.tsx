import { Pressable, StyleSheet, Text, View } from 'react-native';

type AirplaneControlsProps = {
  speed: number;
  altitude: number;
  fuel: number;
  airborne: boolean;
  canLand: boolean;
  canParachute?: boolean;
  onThrottle: () => void;
  onBrake: () => void;
  onTakeoff: () => void;
  onLand: () => void;
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onAltitudeUp: () => void;
  onAltitudeDown: () => void;
  onParachute: () => void;
  onToggleMap: () => void;
  onEmergencyReturn: () => void;
};

function ControlButton({ label, disabled = false, onPress }: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={disabled} style={[styles.button, disabled && styles.disabledButton]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export default function AirplaneControls({
  speed,
  altitude,
  fuel,
  airborne,
  canLand,
  canParachute = airborne,
  onThrottle,
  onBrake,
  onTakeoff,
  onLand,
  onSteerLeft,
  onSteerRight,
  onAltitudeUp,
  onAltitudeDown,
  onParachute,
  onToggleMap,
  onEmergencyReturn,
}: AirplaneControlsProps) {
  return (
    <View style={styles.root}>
      <View style={styles.display}>
        <Text style={styles.displayText}>SPD {Math.round(speed)}</Text>
        <Text style={styles.displayText}>ALT {Math.round(altitude)}</Text>
        <Text style={styles.displayText}>FUEL {Math.round(fuel)}%</Text>
      </View>
      <View style={styles.grid}>
        <ControlButton label="THROTTLE" onPress={onThrottle} />
        <ControlButton label="BRAKE" onPress={onBrake} />
        <ControlButton label="TAKEOFF" disabled={airborne} onPress={onTakeoff} />
        <ControlButton label="LAND" disabled={!canLand} onPress={onLand} />
        <ControlButton label="STEER LEFT" onPress={onSteerLeft} />
        <ControlButton label="STEER RIGHT" onPress={onSteerRight} />
        <ControlButton label="ALT UP" onPress={onAltitudeUp} />
        <ControlButton label="ALT DOWN" onPress={onAltitudeDown} />
        <ControlButton label="PARACHUTE" disabled={!canParachute} onPress={onParachute} />
        <ControlButton label="DEST MAP" onPress={onToggleMap} />
        <ControlButton label="RETURN" onPress={onEmergencyReturn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 338,
    padding: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffbd28',
    backgroundColor: 'rgba(5, 5, 16, 0.86)',
  },
  display: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  displayText: {
    color: '#8ee8ff',
    fontSize: 12,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  button: {
    width: 100,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(26, 12, 32, 0.96)',
  },
  disabledButton: {
    opacity: 0.42,
    borderColor: '#6f7484',
  },
  buttonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
});
