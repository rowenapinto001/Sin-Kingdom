import { StyleSheet, Text, View } from 'react-native';
import { friendsHouseExterior } from '../../data/friendsHouseExteriorConfig';

type FriendsHouseExteriorProps = {
  x: number;
  y: number;
};

const flowerBeds = [
  { x: 98, y: 400 },
  { x: 190, y: 455 },
  { x: 286, y: 405 },
  { x: 704, y: 404 },
  { x: 788, y: 462 },
];

const bushes = [
  { x: 86, y: 326, size: 54 },
  { x: 160, y: 310, size: 42 },
  { x: 760, y: 320, size: 50 },
  { x: 804, y: 520, size: 42 },
  { x: 232, y: 522, size: 44 },
  { x: 604, y: 522, size: 44 },
];

const lamps = [
  { x: 276, y: 542 },
  { x: 590, y: 542 },
  { x: 340, y: 350 },
  { x: 525, y: 350 },
];

export default function FriendsHouseExterior({ x, y }: FriendsHouseExteriorProps) {
  const { width, height, house, driveway, gate, road, frontDoorZone } = friendsHouseExterior;

  return (
    <View pointerEvents="none" style={[styles.root, { left: x, top: y, width, height }]}>
      <View style={styles.lawnBase} />
      <View style={styles.lawnTextureA} />
      <View style={styles.lawnTextureB} />

      <View style={[styles.frontRoad, { left: road.x, top: road.y, width: road.width, height: road.height }]}>
        <View style={styles.roadDashLeft} />
        <View style={styles.roadDashRight} />
      </View>
      <View style={styles.sidewalk} />

      <View style={[styles.driveway, { left: driveway.x, top: driveway.y, width: driveway.width, height: driveway.height }]}>
        <View style={styles.drivewayTileA} />
        <View style={styles.drivewayTileB} />
        <View style={styles.carShadow} />
        <View style={styles.blackSuv}>
          <View style={styles.suvWindshield} />
          <View style={styles.suvRoof} />
          <View style={styles.suvLightLeft} />
          <View style={styles.suvLightRight} />
        </View>
      </View>

      <View style={styles.mainWalkway} />
      <View style={styles.crossWalkway} />
      <View style={styles.roundGarden}>
        <View style={styles.fountainOuter}>
          <View style={styles.fountainWater} />
        </View>
      </View>

      {flowerBeds.map((bed) => (
        <View key={`${bed.x}-${bed.y}`} style={[styles.flowerBed, { left: bed.x, top: bed.y }]}>
          <View style={styles.flowerDotPink} />
          <View style={styles.flowerDotGold} />
          <View style={styles.flowerDotWhite} />
          <View style={styles.flowerDotPurple} />
        </View>
      ))}

      {bushes.map((bush) => (
        <View key={`${bush.x}-${bush.y}`} style={[styles.roundBush, { left: bush.x, top: bush.y, width: bush.size, height: bush.size, borderRadius: bush.size / 2 }]}>
          <View style={styles.bushHighlight} />
        </View>
      ))}

      {lamps.map((lamp) => (
        <View key={`${lamp.x}-${lamp.y}`} style={[styles.lamp, { left: lamp.x, top: lamp.y }]}>
          <View style={styles.lampGlow} />
          <View style={styles.lampPost} />
        </View>
      ))}

      <View style={[styles.houseShadow, { left: house.x + 16, top: house.y + 22, width: house.width, height: house.height }]} />
      <View style={[styles.mansion, { left: house.x, top: house.y, width: house.width, height: house.height }]}>
        <View style={styles.roofBack} />
        <View style={styles.roofMain} />
        <View style={styles.roofLeftWing} />
        <View style={styles.roofRightWing} />
        <View style={styles.houseWall} />
        <View style={styles.leftWingWall} />
        <View style={styles.rightGarageWall} />
        <View style={styles.frontDoor} />
        <View style={styles.doorGlow} />
        <View style={[styles.window, { left: 78, top: 138 }]} />
        <View style={[styles.window, { left: 170, top: 138 }]} />
        <View style={[styles.window, { right: 170, top: 138 }]} />
        <View style={[styles.window, { right: 78, top: 138 }]} />
        <View style={[styles.windowSmall, { left: 96, top: 68 }]} />
        <View style={[styles.windowSmall, { right: 96, top: 68 }]} />
        <View style={styles.garageDoor} />
        <View style={styles.roofRidge} />
      </View>

      <View style={styles.frontPorch} />
      <View style={[styles.enterGlow, { left: frontDoorZone.x + 6, top: frontDoorZone.y + 42 }]}>
        <Text style={styles.enterText}>Enter Friends House</Text>
      </View>
      <View style={[styles.frontDoorHotspot, { left: frontDoorZone.x, top: frontDoorZone.y, width: frontDoorZone.width, height: frontDoorZone.height }]} />

      <View style={styles.fenceTop} />
      <View style={styles.fenceLeft} />
      <View style={styles.fenceRight} />
      <View style={[styles.gate, { left: gate.x, top: gate.y, width: gate.width, height: gate.height }]}>
        <View style={styles.gatePillarLeft}>
          <View style={styles.pillarLamp} />
        </View>
        <View style={styles.gateBars}>
          <View style={styles.gateBarLine} />
          <View style={[styles.gateBarLine, { left: 48 }]} />
          <View style={[styles.gateBarLine, { left: 90 }]} />
          <View style={[styles.gateBarLine, { left: 132 }]} />
          <View style={[styles.gateBarLine, { left: 174 }]} />
        </View>
        <Text style={styles.gateSign}>Friends House</Text>
        <View style={styles.gatePillarRight}>
          <View style={styles.pillarLamp} />
        </View>
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
    backgroundColor: '#265d32',
    shadowColor: '#000',
    shadowOpacity: 0.72,
    shadowRadius: 18,
  },
  lawnBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#2f7739',
  },
  lawnTextureA: {
    position: 'absolute',
    left: -80,
    top: 0,
    width: 460,
    height: 650,
    transform: [{ skewX: '-14deg' }],
    backgroundColor: 'rgba(91,170,78,0.28)',
  },
  lawnTextureB: {
    position: 'absolute',
    right: -70,
    top: 0,
    width: 410,
    height: 650,
    transform: [{ skewX: '-14deg' }],
    backgroundColor: 'rgba(25,88,39,0.22)',
  },
  frontRoad: {
    position: 'absolute',
    backgroundColor: '#20242b',
    borderTopWidth: 8,
    borderTopColor: '#b8ad90',
  },
  roadDashLeft: {
    position: 'absolute',
    left: 100,
    top: 50,
    width: 250,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ffc640',
  },
  roadDashRight: {
    position: 'absolute',
    right: 100,
    top: 50,
    width: 250,
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
    backgroundColor: '#b9b098',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#e3d8af',
  },
  driveway: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: '#968f80',
    borderWidth: 3,
    borderColor: '#d3c896',
    borderRadius: 12,
  },
  drivewayTileA: {
    position: 'absolute',
    left: 0,
    top: 66,
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  drivewayTileB: {
    position: 'absolute',
    left: 0,
    top: 138,
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  carShadow: {
    position: 'absolute',
    left: 35,
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
  suvWindshield: {
    position: 'absolute',
    left: 14,
    top: 10,
    width: 64,
    height: 20,
    borderRadius: 8,
    backgroundColor: '#2c4a5c',
  },
  suvRoof: {
    position: 'absolute',
    left: 18,
    top: 35,
    width: 56,
    height: 26,
    borderRadius: 9,
    backgroundColor: '#1c2027',
  },
  suvLightLeft: {
    position: 'absolute',
    left: 12,
    bottom: 7,
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd36b',
  },
  suvLightRight: {
    position: 'absolute',
    right: 12,
    bottom: 7,
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffd36b',
  },
  mainWalkway: {
    position: 'absolute',
    left: 425,
    top: 340,
    width: 52,
    height: 244,
    backgroundColor: '#b9aa85',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#e5d8ad',
  },
  crossWalkway: {
    position: 'absolute',
    left: 238,
    top: 454,
    width: 424,
    height: 38,
    backgroundColor: '#b9aa85',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#e5d8ad',
  },
  roundGarden: {
    position: 'absolute',
    left: 358,
    top: 398,
    width: 184,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#c7b98f',
    borderWidth: 4,
    borderColor: '#e8dca7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fountainOuter: {
    width: 78,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d9cfad',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fountainWater: {
    width: 58,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#42b3c8',
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
  flowerDotPurple: {
    position: 'absolute',
    right: 28,
    bottom: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#c987ff',
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
  lamp: {
    position: 'absolute',
    width: 22,
    height: 48,
    alignItems: 'center',
  },
  lampGlow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffe8a0',
    shadowColor: '#ffd36b',
    shadowOpacity: 0.9,
    shadowRadius: 9,
  },
  lampPost: {
    width: 5,
    height: 30,
    backgroundColor: '#171719',
  },
  houseShadow: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  mansion: {
    position: 'absolute',
  },
  roofBack: {
    position: 'absolute',
    left: 34,
    top: 0,
    width: 472,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#20252b',
    borderWidth: 4,
    borderColor: '#424b55',
  },
  roofMain: {
    position: 'absolute',
    left: 74,
    top: 32,
    width: 392,
    height: 112,
    borderRadius: 16,
    backgroundColor: '#2d343c',
    borderWidth: 5,
    borderColor: '#56606a',
  },
  roofLeftWing: {
    position: 'absolute',
    left: 0,
    top: 78,
    width: 150,
    height: 122,
    borderRadius: 14,
    backgroundColor: '#252c34',
    borderWidth: 4,
    borderColor: '#4b5660',
  },
  roofRightWing: {
    position: 'absolute',
    right: 0,
    top: 78,
    width: 164,
    height: 122,
    borderRadius: 14,
    backgroundColor: '#252c34',
    borderWidth: 4,
    borderColor: '#4b5660',
  },
  houseWall: {
    position: 'absolute',
    left: 72,
    top: 126,
    width: 396,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#b99e75',
    borderWidth: 4,
    borderColor: '#e6d4a6',
  },
  leftWingWall: {
    position: 'absolute',
    left: 18,
    top: 150,
    width: 116,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#a98f69',
    borderWidth: 3,
    borderColor: '#dcc899',
  },
  rightGarageWall: {
    position: 'absolute',
    right: 18,
    top: 150,
    width: 130,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#9d8666',
    borderWidth: 3,
    borderColor: '#dcc899',
  },
  frontDoor: {
    position: 'absolute',
    left: 238,
    top: 176,
    width: 64,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#261a16',
    borderWidth: 3,
    borderColor: '#ffcf77',
  },
  doorGlow: {
    position: 'absolute',
    left: 248,
    top: 186,
    width: 44,
    height: 58,
    borderRadius: 8,
    backgroundColor: 'rgba(255,187,74,0.18)',
  },
  window: {
    position: 'absolute',
    width: 48,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#ffd374',
    borderWidth: 3,
    borderColor: '#3b2e24',
    shadowColor: '#ffb94c',
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  windowSmall: {
    position: 'absolute',
    width: 42,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#ffdc87',
    borderWidth: 3,
    borderColor: '#3b2e24',
  },
  garageDoor: {
    position: 'absolute',
    right: 42,
    top: 178,
    width: 86,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#4b4c4c',
    borderWidth: 4,
    borderColor: '#272a2f',
  },
  roofRidge: {
    position: 'absolute',
    left: 124,
    top: 84,
    width: 290,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  frontPorch: {
    position: 'absolute',
    left: 384,
    top: 318,
    width: 132,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#b6a67d',
    borderWidth: 3,
    borderColor: '#eadfaf',
  },
  enterGlow: {
    position: 'absolute',
    width: 148,
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
    alignItems: 'center',
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
    alignItems: 'center',
  },
  pillarLamp: {
    marginTop: -12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffdd88',
    shadowColor: '#ffd36b',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  gateBars: {
    width: 210,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#111318',
    borderWidth: 3,
    borderColor: '#d9c781',
  },
  gateBarLine: {
    position: 'absolute',
    left: 12,
    top: 5,
    width: 5,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#d9c781',
  },
  gateSign: {
    position: 'absolute',
    top: -18,
    color: '#ffe29b',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
});
