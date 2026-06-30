import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { getLocationConfig } from '../../data/locationConfigs';
import { WorldLocation } from '../worldTypes';

type LocationTileProps = {
  location: WorldLocation;
  caughtByPolice?: boolean;
};

export default function LocationTile({ location, caughtByPolice = false }: LocationTileProps) {
  const config = getLocationConfig(location.id);
  const canEnter = location.id === 'policeStation' ? caughtByPolice : config.enterable;

  return (
    <View
      style={[
        styles.root,
        {
          left: config.x,
          top: config.y,
          width: config.width,
          height: config.height,
          borderColor: canEnter ? location.accent : '#667084',
        },
      ]}
    >
      <ImageBackground source={config.image} resizeMode="cover" style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.vignette} />
        <View style={styles.overlay}>
          <Text style={styles.name} numberOfLines={1}>
            {config.name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {config.description}
          </Text>
          <View style={[styles.enterBadge, !canEnter && styles.enterBadgeDisabled]}>
            <Text style={styles.enterText}>{canEnter ? 'ENTER' : 'LOCKED'}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#06030a',
    shadowColor: '#ff2e8a',
    shadowOpacity: 0.62,
    shadowRadius: 12,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 11,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 2, 10, 0.08)',
  },
  overlay: {
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 9,
    backgroundColor: 'rgba(5, 2, 8, 0.78)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 46, 138, 0.72)',
  },
  name: {
    color: '#fff9e8',
    fontSize: 15,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 7,
  },
  description: {
    marginTop: 3,
    color: '#ead9f5',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  enterBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ffbd28',
    borderWidth: 1,
    borderColor: '#fff2a6',
  },
  enterBadgeDisabled: {
    backgroundColor: '#32394a',
    borderColor: '#8f9bb0',
  },
  enterText: {
    color: '#11040a',
    fontSize: 9,
    fontWeight: '900',
  },
});
