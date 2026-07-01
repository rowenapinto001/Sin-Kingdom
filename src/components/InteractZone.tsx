import { Pressable, StyleSheet, Text, View } from 'react-native';

type InteractZoneProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function InteractZone({ x, y, width, height, label, active = false, disabled = false, onPress }: InteractZoneProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.root,
        {
          left: x,
          top: y,
          width,
          height,
          borderColor: active ? '#ffbd28' : '#ff2e8a',
        },
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.pulse, active && styles.pulseActive]} />
      <Text style={styles.label} numberOfLines={2}>
        {disabled ? 'LOCKED' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(8, 3, 16, 0.52)',
    shadowColor: '#ff2e8a',
    shadowOpacity: 0.66,
    shadowRadius: 10,
  },
  disabled: {
    opacity: 0.46,
    borderColor: '#687084',
  },
  pulse: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 7,
    right: 7,
    backgroundColor: '#ff2e8a',
  },
  pulseActive: {
    backgroundColor: '#ffbd28',
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
});
