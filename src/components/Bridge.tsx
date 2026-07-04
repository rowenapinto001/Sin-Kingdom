import { ImageBackground, StyleSheet, View } from 'react-native';
import { BridgeConfig } from '../data/bridgeConfigs';

const bridgeArtwork = require('../../assets/environment/bridges/friends_canal_bridge_v3.png');

type BridgeProps = {
  config: BridgeConfig;
};

export default function Bridge({ config }: BridgeProps) {
  return (
    <View style={[styles.root, { width: config.bounds.width, height: config.bounds.height }]}>
      <ImageBackground source={bridgeArtwork} resizeMode="cover" style={styles.artwork} imageStyle={styles.artworkImage} />
      <View pointerEvents="none" style={[styles.edgeFade, styles.edgeFadeLeft]} />
      <View pointerEvents="none" style={[styles.edgeFade, styles.edgeFadeRight]} />
      <View pointerEvents="none" style={[styles.edgeFadeHorizontal, styles.edgeFadeTop]} />
      <View pointerEvents="none" style={[styles.edgeFadeHorizontal, styles.edgeFadeBottom]} />
      <View pointerEvents="none" style={[styles.curbStrip, styles.curbTop]}>
        {Array.from({ length: 22 }).map((_, index) => (
          <View key={`top-${index}`} style={[styles.curbTileLineVertical, { left: index * 46 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={[styles.curbStrip, styles.curbBottom]}>
        {Array.from({ length: 22 }).map((_, index) => (
          <View key={`bottom-${index}`} style={[styles.curbTileLineVertical, { left: index * 46 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={[styles.curbStripSide, styles.curbLeft]}>
        {Array.from({ length: 13 }).map((_, index) => (
          <View key={`left-${index}`} style={[styles.curbTileLineHorizontal, { top: index * 44 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={[styles.curbStripSide, styles.curbRight]}>
        {Array.from({ length: 13 }).map((_, index) => (
          <View key={`right-${index}`} style={[styles.curbTileLineHorizontal, { top: index * 44 }]} />
        ))}
      </View>
      <View pointerEvents="none" style={styles.outerStoneFrame} />
      <View pointerEvents="none" style={[styles.cornerBlock, styles.cornerTopLeft]} />
      <View pointerEvents="none" style={[styles.cornerBlock, styles.cornerTopRight]} />
      <View pointerEvents="none" style={[styles.cornerBlock, styles.cornerBottomLeft]} />
      <View pointerEvents="none" style={[styles.cornerBlock, styles.cornerBottomRight]} />
      <View pointerEvents="none" style={[styles.cornerPin, styles.cornerPinTopLeft]} />
      <View pointerEvents="none" style={[styles.cornerPin, styles.cornerPinTopRight]} />
      <View pointerEvents="none" style={[styles.cornerPin, styles.cornerPinBottomLeft]} />
      <View pointerEvents="none" style={[styles.cornerPin, styles.cornerPinBottomRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#0a5f78',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  artwork: {
    flex: 1,
  },
  artworkImage: {
    borderRadius: 24,
  },
  edgeFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(38,116,48,0.2)',
  },
  edgeFadeLeft: {
    left: 0,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderRightWidth: 1,
    borderRightColor: 'rgba(96,154,76,0.18)',
  },
  edgeFadeRight: {
    right: 0,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(96,154,76,0.18)',
  },
  edgeFadeHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(31,88,42,0.18)',
  },
  edgeFadeTop: {
    top: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  edgeFadeBottom: {
    bottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  outerStoneFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 8,
    borderColor: '#b9aa7c',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  curbStrip: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 30,
    backgroundColor: '#b4aa91',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#e2d19a',
    overflow: 'hidden',
  },
  curbTop: {
    top: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  curbBottom: {
    bottom: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  curbStripSide: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 30,
    backgroundColor: '#b4aa91',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#e2d19a',
    overflow: 'hidden',
  },
  curbLeft: {
    left: 8,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  curbRight: {
    right: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  curbTileLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(68,57,44,0.34)',
  },
  curbTileLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(68,57,44,0.34)',
  },
  cornerBlock: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 22,
    backgroundColor: '#9f947b',
    borderWidth: 4,
    borderColor: '#ead99a',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  cornerTopLeft: {
    left: 10,
    top: 10,
  },
  cornerTopRight: {
    right: 10,
    top: 10,
  },
  cornerBottomLeft: {
    left: 10,
    bottom: 10,
  },
  cornerBottomRight: {
    right: 10,
    bottom: 10,
  },
  cornerPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3d36b',
    borderWidth: 3,
    borderColor: '#4a3d2c',
  },
  cornerPinTopLeft: {
    left: 16,
    top: 16,
  },
  cornerPinTopRight: {
    right: 16,
    top: 16,
  },
  cornerPinBottomLeft: {
    left: 16,
    bottom: 16,
  },
  cornerPinBottomRight: {
    right: 16,
    bottom: 16,
  },
});
