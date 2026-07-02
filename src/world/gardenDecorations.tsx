import { Image, StyleSheet, View } from 'react-native';
import { gardenDecorations, grassTiles } from '../data/landscapeConfigs';
import { GardenDecoration, GrassTile } from './grassSystem';

const grassTexture = require('../../assets/environment/grass/grass_texture.png');
const gardenSprites = {
  roundBush: require('../../assets/environment/garden/round_bush.png'),
  squareHedge: require('../../assets/environment/garden/square_hedge.png'),
  coneTree: require('../../assets/environment/garden/cone_tree.png'),
  spiralTopiary: require('../../assets/environment/garden/spiral_topiary.png'),
  flowerBed: require('../../assets/environment/garden/flower_bed.png'),
  smallPlant: require('../../assets/environment/garden/small_plant.png'),
  hedgeWall: require('../../assets/environment/garden/hedge_wall.png'),
  gardenPath: require('../../assets/environment/garden/garden_path.png'),
} as const;
const GRASS_TEXTURE_SIZE = 256;

function GrassTileView({ tile }: { tile: GrassTile }) {
  const columns = Math.ceil(tile.width / GRASS_TEXTURE_SIZE);
  const rows = Math.ceil(tile.height / GRASS_TEXTURE_SIZE);
  const flowerCount = tile.type === 'flower' || tile.type === 'meadow' ? 38 : tile.type === 'luxury' || tile.type === 'royal' ? 12 : 0;
  const trimCount = tile.type === 'trimmed' || tile.type === 'royal' ? Math.max(4, Math.floor(tile.width / 180)) : 0;

  return (
    <View style={[styles.grassTile, styles[`grass_${tile.type}`], { left: tile.x, top: tile.y, width: tile.width, height: tile.height }]}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((__, column) => (
          <Image
            key={`texture-${row}-${column}`}
            source={grassTexture}
            style={[
              styles.grassTextureTile,
              {
                left: column * GRASS_TEXTURE_SIZE,
                top: row * GRASS_TEXTURE_SIZE,
              },
            ]}
          />
        )),
      )}
      <View style={[styles.grassTone, styles[`grassTone_${tile.type}`]]} />
      <View style={styles.lawnShadeBottom} />
      <View style={styles.lawnHighlight} />
      {Array.from({ length: trimCount }).map((_, index) => (
        <View
          key={`trim-line-${index}`}
          style={[
            styles.trimmedLawnLine,
            {
              left: 26 + index * 180,
              top: index % 2 === 0 ? 38 : Math.max(40, tile.height - 72),
            },
          ]}
        />
      ))}
      {Array.from({ length: flowerCount }).map((_, index) => (
        <View
          key={`flower-${index}`}
          style={[
            styles.tinyFlower,
            index % 3 === 1 && styles.tinyFlowerGold,
            index % 3 === 2 && styles.tinyFlowerWhite,
            {
              left: 24 + ((index * 97) % Math.max(80, tile.width - 60)),
              top: 24 + ((index * 61) % Math.max(70, tile.height - 50)),
              opacity: tile.type === 'flower' || tile.type === 'meadow' ? 0.82 : 0.5,
            },
          ]}
        />
      ))}
    </View>
  );
}

function GardenDecorationView({ decoration }: { decoration: GardenDecoration }) {
  const commonStyle = {
    left: decoration.x,
    top: decoration.y,
    width: decoration.width,
    height: decoration.height,
    transform: decoration.rotate ? [{ rotate: decoration.rotate }] : undefined,
  };

  const spriteSource = gardenSprites[decoration.type];
  const imageMode = decoration.type === 'hedgeWall' || decoration.type === 'gardenPath' ? 'stretch' : 'contain';

  return (
    <View style={[styles.gardenSpriteWrap, commonStyle]}>
      <Image source={spriteSource} resizeMode={imageMode} style={styles.gardenSpriteImage} />
    </View>
  );
}

export function FullWorldGrass({ width, height }: { width: number; height: number }) {
  return <GrassTileView tile={{ id: 'full-world-grass', x: 0, y: 0, width, height, type: 'wild' }} />;
}

export default function LandscapeLayer() {
  return (
    <>
      {grassTiles.map((tile) => (
        <GrassTileView key={tile.id} tile={tile} />
      ))}
      {gardenDecorations.map((decoration) => (
        <GardenDecorationView key={decoration.id} decoration={decoration} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  gardenSpriteWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gardenSpriteImage: {
    width: '100%',
    height: '100%',
  },
  grassTile: {
    position: 'absolute',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#001909',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  grass_normal: {
    backgroundColor: '#2f793a',
  },
  grass_light: {
    backgroundColor: '#4f9246',
  },
  grass_dark: {
    backgroundColor: '#205b2d',
  },
  grass_flower: {
    backgroundColor: '#3d823d',
  },
  grass_trimmed: {
    backgroundColor: '#428842',
  },
  grass_luxury: {
    backgroundColor: '#347f38',
  },
  grassTextureTile: {
    position: 'absolute',
    width: GRASS_TEXTURE_SIZE,
    height: GRASS_TEXTURE_SIZE,
    opacity: 0.94,
  },
  grassTone: {
    ...StyleSheet.absoluteFill,
  },
  grassTone_normal: {
    backgroundColor: 'rgba(35,105,45,0.08)',
  },
  grassTone_light: {
    backgroundColor: 'rgba(141,196,85,0.1)',
  },
  grassTone_dark: {
    backgroundColor: 'rgba(7,48,20,0.2)',
  },
  grassTone_flower: {
    backgroundColor: 'rgba(45,110,42,0.02)',
  },
  grassTone_trimmed: {
    backgroundColor: 'rgba(86,140,52,0.08)',
  },
  grassTone_luxury: {
    backgroundColor: 'rgba(23,92,31,0.08)',
  },
  grass_meadow: {
    backgroundColor: '#4a8f3f',
  },
  grass_wild: {
    backgroundColor: '#276636',
  },
  grass_clover: {
    backgroundColor: '#33823a',
  },
  grass_royal: {
    backgroundColor: '#3f8a3e',
  },
  grassTone_meadow: {
    backgroundColor: 'rgba(103,155,52,0.04)',
  },
  grassTone_wild: {
    backgroundColor: 'rgba(4,47,23,0.22)',
  },
  grassTone_clover: {
    backgroundColor: 'rgba(28,105,37,0.1)',
  },
  grassTone_royal: {
    backgroundColor: 'rgba(88,137,44,0.08)',
  },
  lawnShadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '32%',
    backgroundColor: 'rgba(4,42,16,0.14)',
  },
  lawnHighlight: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 18,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(222,255,163,0.08)',
  },
  tinyFlower: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff74cc',
    borderWidth: 1,
    borderColor: 'rgba(255,240,166,0.75)',
    shadowColor: '#fff3a6',
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  tinyFlowerGold: {
    backgroundColor: '#ffd35a',
  },
  tinyFlowerWhite: {
    backgroundColor: '#f6fff2',
  },
  trimmedLawnLine: {
    position: 'absolute',
    width: 112,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(208,246,132,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(238,255,177,0.14)',
  },
  gardenPath: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#cba46b',
    borderWidth: 2,
    borderColor: '#f6dfaa',
    overflow: 'hidden',
  },
  gardenPathShine: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  flowerBed: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  flowerLeafA: {
    position: 'absolute',
    left: 2,
    top: 8,
    width: '72%',
    height: '58%',
    borderRadius: 999,
    backgroundColor: '#2b7530',
    borderWidth: 1,
    borderColor: 'rgba(126,188,75,0.55)',
  },
  flowerLeafB: {
    position: 'absolute',
    right: 1,
    top: 4,
    width: '58%',
    height: '62%',
    borderRadius: 999,
    backgroundColor: '#338737',
  },
  flowerLeafC: {
    position: 'absolute',
    left: '18%',
    bottom: 1,
    width: '62%',
    height: '46%',
    borderRadius: 999,
    backgroundColor: '#1f612c',
  },
  flowerLeafD: {
    position: 'absolute',
    left: '36%',
    top: 0,
    width: '42%',
    height: '42%',
    borderRadius: 999,
    backgroundColor: '#4b9d3e',
  },
  flowerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,224,0.65)',
  },
  flowerPink: {
    backgroundColor: '#ff61d8',
  },
  flowerGold: {
    backgroundColor: '#ffbd28',
  },
  flowerWhite: {
    backgroundColor: '#fff6dc',
  },
  flowerPurple: {
    backgroundColor: '#c183ff',
  },
  flowerDotA: {
    left: '18%',
    top: '30%',
  },
  flowerDotB: {
    right: '22%',
    top: '22%',
  },
  flowerDotC: {
    left: '42%',
    bottom: '18%',
  },
  flowerDotD: {
    right: '10%',
    bottom: '28%',
  },
  roundBush: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'visible',
  },
  bushShadowInset: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: -2,
    height: '26%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  bushLobeA: {
    position: 'absolute',
    left: 0,
    top: '20%',
    width: '64%',
    height: '62%',
    borderRadius: 999,
    backgroundColor: '#2b7734',
    borderWidth: 1,
    borderColor: 'rgba(146,203,92,0.45)',
  },
  bushLobeB: {
    position: 'absolute',
    right: 0,
    top: '18%',
    width: '66%',
    height: '64%',
    borderRadius: 999,
    backgroundColor: '#31873a',
    borderWidth: 1,
    borderColor: 'rgba(173,221,102,0.42)',
  },
  bushLobeC: {
    position: 'absolute',
    left: '18%',
    top: 0,
    width: '60%',
    height: '58%',
    borderRadius: 999,
    backgroundColor: '#48a340',
  },
  bushLobeD: {
    position: 'absolute',
    left: '22%',
    bottom: '8%',
    width: '56%',
    height: '46%',
    borderRadius: 999,
    backgroundColor: '#205f2e',
  },
  bushHighlight: {
    position: 'absolute',
    left: '28%',
    top: '15%',
    width: '34%',
    height: '22%',
    borderRadius: 999,
    backgroundColor: 'rgba(205,242,128,0.24)',
  },
  bushDot: {
    position: 'absolute',
    right: '22%',
    bottom: '27%',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(17,80,31,0.8)',
  },
  bushDotAlt: {
    position: 'absolute',
    left: '24%',
    bottom: '32%',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(183,226,112,0.3)',
  },
  bushLeafSparkle: {
    position: 'absolute',
    left: '52%',
    top: '24%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(218,246,144,0.34)',
  },
  squareHedge: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#276932',
    borderWidth: 1,
    borderColor: 'rgba(126,188,74,0.55)',
    overflow: 'hidden',
    shadowColor: '#001909',
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
  hedgeWall: {
    borderRadius: 8,
    backgroundColor: '#2c7130',
  },
  hedgeHighlight: {
    margin: 4,
    flex: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(170,222,96,0.2)',
  },
  hedgeTextureA: {
    position: 'absolute',
    left: 8,
    top: 6,
    width: '34%',
    height: '52%',
    borderRadius: 999,
    backgroundColor: 'rgba(177,229,111,0.18)',
  },
  hedgeTextureB: {
    position: 'absolute',
    right: 8,
    bottom: 5,
    width: '38%',
    height: '34%',
    borderRadius: 999,
    backgroundColor: 'rgba(4,48,18,0.24)',
  },
  coneTree: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  coneLayerBottom: {
    position: 'absolute',
    bottom: 0,
    width: '86%',
    height: '44%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#246d32',
    borderWidth: 2,
    borderColor: 'rgba(150,222,98,0.82)',
  },
  coneLayerMiddle: {
    position: 'absolute',
    bottom: '28%',
    width: '66%',
    height: '38%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#358c38',
    borderWidth: 2,
    borderColor: 'rgba(160,229,104,0.8)',
  },
  coneLayerTop: {
    position: 'absolute',
    bottom: '56%',
    width: '42%',
    height: '34%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#59a93d',
    borderWidth: 1,
    borderColor: 'rgba(216,246,146,0.75)',
  },
  treeShadow: {
    position: 'absolute',
    bottom: -3,
    width: '90%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  spiralTopiary: {
    position: 'absolute',
    alignItems: 'center',
  },
  spiralBase: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: '38%',
    borderRadius: 999,
    backgroundColor: '#246d32',
    borderWidth: 2,
    borderColor: 'rgba(155,225,103,0.82)',
  },
  spiralMiddle: {
    position: 'absolute',
    bottom: '29%',
    width: '62%',
    height: '34%',
    borderRadius: 999,
    backgroundColor: '#368839',
    borderWidth: 2,
    borderColor: 'rgba(187,232,119,0.78)',
  },
  spiralTop: {
    position: 'absolute',
    top: 0,
    width: '42%',
    height: '30%',
    borderRadius: 999,
    backgroundColor: '#5cad3f',
    borderWidth: 1,
    borderColor: 'rgba(221,255,164,0.78)',
  },
  spiralBand: {
    position: 'absolute',
    left: '18%',
    top: '18%',
    width: '70%',
    height: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(233,255,210,0.68)',
    transform: [{ rotate: '-24deg' }],
  },
});
