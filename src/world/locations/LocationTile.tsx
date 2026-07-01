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
  const content = location.id === 'airport' ? (
    <View style={styles.airportArt}>
      <View style={styles.airportSky} />
      <View style={styles.airportTerminal}>
        <View style={styles.airportRoof} />
        <View style={styles.airportGlass}>
          {Array.from({ length: 7 }).map((_, index) => (
            <View key={index} style={styles.airportRib} />
          ))}
        </View>
      </View>
      <View style={styles.airportRoad}>
        <View style={styles.airportRoadLine} />
      </View>
      <View style={styles.airportRunway}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={styles.airportRunwayLight} />
        ))}
      </View>
      <View style={styles.airportPlane}>
        <View style={styles.airportPlaneBody} />
        <View style={styles.airportPlaneWingA} />
        <View style={styles.airportPlaneWingB} />
      </View>
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
    </View>
  ) : (
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
  );

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
      {content}
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
  airportArt: {
    flex: 1,
    backgroundColor: '#17285a',
    overflow: 'hidden',
  },
  airportSky: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '45%',
    backgroundColor: '#d87a7c',
  },
  airportTerminal: {
    position: 'absolute',
    left: '8%',
    top: '18%',
    width: '62%',
    height: '32%',
    borderRadius: 14,
    backgroundColor: '#bc8764',
    borderWidth: 2,
    borderColor: '#f8d796',
    overflow: 'hidden',
  },
  airportRoof: {
    height: '28%',
    backgroundColor: '#d6a06f',
    borderBottomWidth: 1,
    borderBottomColor: '#fff0a6',
  },
  airportGlass: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(101, 198, 242, 0.58)',
  },
  airportRib: {
    width: 3,
    backgroundColor: 'rgba(255,255,255,0.78)',
    transform: [{ skewX: '-14deg' }],
  },
  airportRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '22%',
    height: '16%',
    backgroundColor: '#1f2430',
  },
  airportRoadLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '48%',
    height: 3,
    backgroundColor: '#fff0a6',
  },
  airportRunway: {
    position: 'absolute',
    right: '4%',
    top: '58%',
    width: '42%',
    height: '13%',
    borderRadius: 7,
    backgroundColor: '#232733',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  airportRunwayLight: {
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff0a6',
  },
  airportPlane: {
    position: 'absolute',
    right: '8%',
    top: '33%',
    width: 90,
    height: 48,
  },
  airportPlaneBody: {
    position: 'absolute',
    left: 10,
    top: 18,
    width: 74,
    height: 15,
    borderRadius: 12,
    backgroundColor: '#eaf7ff',
    borderWidth: 1,
    borderColor: '#8ee8ff',
  },
  airportPlaneWingA: {
    position: 'absolute',
    left: 34,
    top: 2,
    width: 24,
    height: 25,
    borderRadius: 7,
    backgroundColor: '#ffbd28',
    transform: [{ rotate: '-18deg' }],
  },
  airportPlaneWingB: {
    position: 'absolute',
    left: 34,
    top: 22,
    width: 24,
    height: 25,
    borderRadius: 7,
    backgroundColor: '#ff2e8a',
    transform: [{ rotate: '18deg' }],
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
