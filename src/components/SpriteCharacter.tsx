import { Image, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { getCharacterConfig } from '../data/characterConfigs';
import { Direction } from '../game/types';
import { useCharacterAnimation } from '../hooks/useCharacterAnimation';
import { CharacterAction } from '../types/CharacterAnimation';
import { createFourDirectionSheet, createStandardAnimations, SpriteSheetLayout } from '../utils/spriteSheet';

const placeholderSource = require('../../assets/player/player.png');
const placeholderSheet = createFourDirectionSheet({
  frameWidth: 32,
  frameHeight: 32,
});
const MAX_GAMEPLAY_FRAME_SIZE = 160;

type SpriteCharacterProps = {
  characterId: string;
  direction: Direction;
  isMoving: boolean;
  currentAction?: CharacterAction;
  frameOverride?: number;
  scale?: number;
  style?: StyleProp<ViewStyle>;
};

function getRenderableSprite(characterId: string, scale?: number): {
  source: ImageSourcePropType;
  sheet: SpriteSheetLayout;
  scale: number;
  animationSpeedMs: number;
  animations: ReturnType<typeof createStandardAnimations> | ReturnType<typeof getCharacterConfig>['animations'];
} {
  const config = getCharacterConfig(characterId);
  const isSingleFrameReference = config.sheet.columns <= 1 || config.sheet.rows <= 1;
  const isOversizedReference = config.sheet.frameWidth > MAX_GAMEPLAY_FRAME_SIZE || config.sheet.frameHeight > MAX_GAMEPLAY_FRAME_SIZE;
  const mustUsePlaceholder = config.needsSpriteReplacement || isSingleFrameReference || isOversizedReference;

  if (mustUsePlaceholder) {
    // TODO: Replace this character's reference art with a proper transparent sprite sheet.
    // Reference/walk/shoot/dance boards are never rendered directly in gameplay.
    return {
      source: placeholderSource,
      sheet: placeholderSheet,
      scale: Math.min(scale && scale >= 1 ? scale : config.fallbackScale ?? config.scale ?? 2, 2.4),
      animationSpeedMs: config.animationSpeedMs,
      animations: createStandardAnimations({ frameDuration: config.animationSpeedMs }),
    };
  }

  return {
    source: config.source,
    sheet: config.sheet,
    scale: scale ?? config.scale,
    animationSpeedMs: config.animationSpeedMs,
    animations: config.animations ?? createStandardAnimations({ frameDuration: config.animationSpeedMs }),
  };
}

export default function SpriteCharacter({
  characterId,
  direction,
  isMoving,
  currentAction,
  frameOverride,
  scale,
  style,
}: SpriteCharacterProps) {
  const sprite = getRenderableSprite(characterId, scale);
  const animation = useCharacterAnimation({
    config: {
      id: characterId,
      name: characterId,
      role: 'reference',
      source: sprite.source,
      sheet: sprite.sheet,
      speed: 0,
      animationSpeedMs: sprite.animationSpeedMs,
      scale: sprite.scale,
      animations: sprite.animations,
    },
    direction,
    isMoving,
    action: currentAction,
    frameOverride,
  });
  const frameX = -animation.frame * sprite.sheet.frameWidth * sprite.scale;
  const frameY = -animation.row * sprite.sheet.frameHeight * sprite.scale;

  return (
    <View
      style={[
        styles.viewport,
        {
          width: sprite.sheet.frameWidth * sprite.scale,
          height: sprite.sheet.frameHeight * sprite.scale,
        },
        style,
      ]}
    >
      <Image
        source={sprite.source}
        style={{
          position: 'absolute',
          width: sprite.sheet.columns * sprite.sheet.frameWidth * sprite.scale,
          height: sprite.sheet.rows * sprite.sheet.frameHeight * sprite.scale,
          left: frameX,
          top: frameY,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
  },
});
