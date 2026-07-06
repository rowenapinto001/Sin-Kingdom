import { ImageBackground, ImageSourcePropType, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

type SceneBackgroundProps = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  children: ReactNode;
};

export default function SceneBackground({ source, width, height, children }: SceneBackgroundProps) {
  return (
    <ImageBackground source={source} resizeMode="cover" style={[styles.background, { width, height }]}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
});
