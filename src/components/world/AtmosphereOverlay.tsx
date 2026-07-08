import { StyleSheet, View } from 'react-native';
import { AtmospherePhase } from '../../data/atmosphereConfig';

type AtmosphereOverlayProps = {
  phase: AtmospherePhase;
  overlayColor: string;
  overlayOpacity: number;
  lightsEnabled: boolean;
  glowColor: string;
  vignetteOpacity: number;
};

export default function AtmosphereOverlay({
  phase,
  overlayColor,
  overlayOpacity,
  lightsEnabled,
  glowColor,
  vignetteOpacity,
}: AtmosphereOverlayProps) {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={[styles.tint, { backgroundColor: overlayColor, opacity: overlayOpacity }]} />
      {phase === 'evening' ? <View style={styles.sunsetBand} /> : null}
      {lightsEnabled ? (
        <>
          <View style={[styles.neonGlow, styles.glowOne, { backgroundColor: glowColor }]} />
          <View style={[styles.neonGlow, styles.glowTwo, { backgroundColor: glowColor }]} />
          <View style={[styles.neonGlow, styles.glowThree, { backgroundColor: glowColor }]} />
        </>
      ) : null}
      {vignetteOpacity > 0 ? <View style={[styles.vignette, { opacity: vignetteOpacity }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 45,
  },
  tint: {
    ...StyleSheet.absoluteFill,
  },
  sunsetBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '28%',
    backgroundColor: 'rgba(255, 46, 138, 0.14)',
  },
  neonGlow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    opacity: 0.22,
  },
  glowOne: {
    left: '8%',
    top: '12%',
  },
  glowTwo: {
    right: '12%',
    top: '28%',
  },
  glowThree: {
    left: '42%',
    bottom: '8%',
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    borderWidth: 80,
    borderColor: 'rgba(0, 0, 0, 0.68)',
  },
});
