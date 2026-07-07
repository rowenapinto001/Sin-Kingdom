import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export type TrafficLightVariant = 'standard' | 'small' | 'intersection';
export type TrafficLightState = 'red' | 'yellow' | 'green';

type TrafficLightProps = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  variant?: TrafficLightVariant;
  activeLight?: TrafficLightState;
  collision?: boolean;
};

const trafficLightImage = require('../../../assets/world/traffic_light.png');

export default function TrafficLight({
  x,
  y,
  rotation = 0,
  scale = 1,
  variant = 'standard',
  activeLight = 'red',
}: TrafficLightProps) {
  const variantScale = variant === 'small' ? 0.82 : variant === 'intersection' ? 1.08 : 1;
  const finalScale = scale * variantScale;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.root,
        {
          left: x,
          top: y,
          transform: [{ rotate: `${rotation}deg` }, { scale: finalScale }],
        },
      ]}
    >
      <Image source={trafficLightImage} resizeMode="contain" style={styles.image} />
      <View style={[styles.glow, styles[activeLight]]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 44,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  image: {
    width: 44,
    height: 96,
  },
  glow: {
    position: 'absolute',
    top: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.7,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  red: {
    backgroundColor: '#ff3030',
    shadowColor: '#ff3030',
  },
  yellow: {
    backgroundColor: '#ffbd28',
    shadowColor: '#ffbd28',
  },
  green: {
    backgroundColor: '#49e58d',
    shadowColor: '#49e58d',
  },
});
