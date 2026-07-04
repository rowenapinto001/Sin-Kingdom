import { Image, StyleSheet, Text, View } from 'react-native';
import { friendsHouseExterior } from '../../data/friendsHouseExteriorConfig';

const exteriorImage = require('../../../assets/locations/friends_house_exterior.png');

type FriendsHouseExteriorProps = {
  x: number;
  y: number;
};

const flowerBeds = [
  { x: 94, y: 410 },
  { x: 185, y: 462 },
  { x: 286, y: 418 },
  { x: 706, y: 420 },
  { x: 790, y: 475 },
];

const bushes = [
  { x: 74, y: 326, size: 54 },
  { x: 168, y: 318, size: 38 },
  { x: 724, y: 318, size: 48 },
  { x: 810, y: 330, size: 42 },
  { x: 255, y: 528, size: 44 },
  { x: 606, y: 526, size: 44 },
];

export default function FriendsHouseExterior({ x, y }: FriendsHouseExteriorProps) {
  const { width, height, house, driveway, gate, road, frontDoorZone } = friendsHouseExterior;

  return (
    <View pointerEvents="none" style={[styles.root, { left: x, top: y, width, height }]}>
      <View style={styles.ground} />

      <View style={[styles.frontRoad, { left: road.x, top: road.y, width: road.width, height: road.height }]}>
        <View style={styles.roadDash} />
      </View>
      <View style={styles.sidewalk} />

      <View style={[styles.driveway, { left: driveway.x, top: driveway.y, width: driveway.width, height: driveway.height }]}>
        <View style={styles.drivewayLines} />
        <View style={styles.carShadow} />
        <View style={styles.blackSuv}>
          <View style={styles.suvWindow} />
          <View style={styles.suvLightLeft} />
          <View style={styles.suvLightRight} />
        </View>
      </View>

      <View style={styles.gardenPathVertical} />
      <View style={styles.gardenPathRoundabout}>
        <View style={styles.fountain} />
      </View>
      <View style={styles.gardenPathHorizontal} />

      {flowerBeds.map((bed) => (
        <View key={`${bed.x}-${bed.y}`} style={[styles.flowerBed, { left: bed.x, top: bed.y }]}>
          <View style={styles.flowerDotPink} />
          <View style={styles.flowerDotGold} />
          <View style={styles.flowerDotWhite} />
        </View>
      ))}
      {bushes.map((bush) => (
        <View key={`${bush.x}-${bush.y}`} style={[styles.roundBush, { left: bush.x, top: bush.y, width: bush.size, height: bush.size, borderRadius: bush.size / 2 }]}>
          <View style={styles.bushHighlight} />
        </View>
      ))}

      <View style={[styles.houseFrame, { left: house.x, top: house.y, width: house.width, height: house.height }]}>
        <Image source={exteriorImage} resizeMode="cover" style={styles.houseImage} />
        <View style={styles.houseVignette} />
      </View>

      <View style={styles.frontPorch} />
      <View style={[styles.enterGlow, { left: frontDoorZone.x + 18, top: frontDoorZone.y + 34 }]}>
        <Text style={styles.enterText}>ENTER HOUSE</Text>
      </View>
      <View style={[styles.frontDoorHotspot, { left: frontDoorZone.x, top: frontDoorZone.y, width: frontDoorZone.width, height: frontDoorZone.height }]} />

      <View style={styles.fenceTop} />
      <View style={styles.fenceLeft} />
      <View style={styles.fenceRight} />
      <View style={[styles.gate, { left: gate.x, top: gate.y, width: gate.width, height: gate.height }]}>
        <View style={styles.gatePillarLeft} />
        <View style={styles.gateBars} />
        <Text style={styles.gateSign}>Friends House</Text>
        <View style={styles.gatePillarRight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#d8c88e',
    backgroundColor: '#204d2f',
    shadowColor: '#000',
    shadowOpacity: 0.72,
    shadowRadius: 18,
  },
  ground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#326f38',
  },
  frontRoad: {
    position: 'absolute',
    backgroundColor: '#1f242c',
    borderTopWidth: 8,
    borderTopColor: '#b5ad91',
  },
  roadDash: {
    position: 'absolute',
    left: 72,
    right: 72,
    top: 50,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ffc640',
  },
  sidewalk: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 584,
    height: 36,
    backgroundColor: '#b7ae96',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#e2d8ae',
  },
  driveway: {
    position: 'absolute',
    backgroundColor: '#918b7a',
    borderWidth: 3,
    borderColor: '#d3c896',
    borderRadius: 12,
  },
  drivewayLines: {
    ...StyleSheet.absoluteFill,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  carShadow: {
    position: 'absolute',
    left: 34,
    top: 112,
    width: 104,
    height: 72,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  blackSuv: {
    position: 'absolute',
    left: 42,
    top: 100,
    width: 92,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#101216',
    borderWidth: 3,
    borderColor: '#353b45',
  },
  suvWindow: {
    position: 'absolute',
    left: 14,
    top: 12,
    width: 64,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#273c4d',
  },
  suvLightLeft: {
    position: 'absolute',
    left: 12,
    bottom: 8,
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd36b',
  },
  suvLightRight: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd36b',
  },
  gardenPathVertical: {
    position: 'absolute',
    left: 425,
    top: 346,
    width: 52,
    height: 236,
    backgroundColor: '#b7a985',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#e3d6ad',
  },
  gardenPathHorizontal: {
    position: 'absolute',
    left: 245,
    top: 456,
    width: 410,
    height: 38,
    backgroundColor: '#b7a985',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#e3d6ad',
  },
  gardenPathRoundabout: {
    position: 'absolute',
    left: 358,
    top: 404,
    width: 184,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#c6b78e',
    borderWidth: 4,
    borderColor: '#e7d99f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fountain: {
    width: 72,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#47b6c6',
    borderWidth: 4,
    borderColor: '#e8dcb4',
  },
  flowerBed: {
    position: 'absolute',
    width: 76,
    height: 42,
    borderRadius: 18,
    backgroundColor: '#235f2f',
    borderWidth: 2,
    borderColor: '#88c56d',
  },
  flowerDotPink: {
    position: 'absolute',
    left: 13,
    top: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff69b8',
  },
  flowerDotGold: {
    position: 'absolute',
    left: 34,
    top: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffd050',
  },
  flowerDotWhite: {
    position: 'absolute',
    right: 14,
    top: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f3fff0',
  },
  roundBush: {
    position: 'absolute',
    backgroundColor: '#2f8e38',
    borderWidth: 4,
    borderColor: '#83da73',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  bushHighlight: {
    position: 'absolute',
    left: 12,
    top: 10,
    width: 18,
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(185,255,137,0.42)',
  },
  houseFrame: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#d8c88e',
    backgroundColor: '#111416',
  },
  houseImage: {
    width: '100%',
    height: '100%',
  },
  houseVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  frontPorch: {
    position: 'absolute',
    left: 384,
    top: 332,
    width: 132,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#b6a67d',
    borderWidth: 3,
    borderColor: '#eadfaf',
  },
  enterGlow: {
    position: 'absolute',
    width: 124,
    height: 34,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,8,13,0.82)',
    borderWidth: 2,
    borderColor: '#ffc334',
    shadowColor: '#ffc334',
    shadowOpacity: 0.75,
    shadowRadius: 10,
  },
  enterText: {
    color: '#ffc334',
    fontSize: 10,
    fontWeight: '900',
  },
  frontDoorHotspot: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,195,52,0.48)',
    backgroundColor: 'rgba(255,195,52,0.06)',
  },
  fenceTop: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 24,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#181512',
    borderWidth: 2,
    borderColor: '#a78c50',
  },
  fenceLeft: {
    position: 'absolute',
    left: 20,
    top: 30,
    bottom: 76,
    width: 10,
    borderRadius: 6,
    backgroundColor: '#181512',
    borderWidth: 2,
    borderColor: '#a78c50',
  },
  fenceRight: {
    position: 'absolute',
    right: 20,
    top: 30,
    bottom: 76,
    width: 10,
    borderRadius: 6,
    backgroundColor: '#181512',
    borderWidth: 2,
    borderColor: '#a78c50',
  },
  gate: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatePillarLeft: {
    position: 'absolute',
    left: 0,
    width: 30,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#8a7a58',
    borderWidth: 3,
    borderColor: '#d9c781',
  },
  gatePillarRight: {
    position: 'absolute',
    right: 0,
    width: 30,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#8a7a58',
    borderWidth: 3,
    borderColor: '#d9c781',
  },
  gateBars: {
    width: 210,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#111318',
    borderWidth: 3,
    borderColor: '#d9c781',
  },
  gateSign: {
    position: 'absolute',
    top: -16,
    color: '#ffe29b',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
});
