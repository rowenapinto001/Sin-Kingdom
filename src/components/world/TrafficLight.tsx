import React from 'react';
import { StyleSheet, View } from 'react-native';

export type TrafficLightVariant = 'standard' | 'small' | 'intersection';
export type TrafficLightState = 'red' | 'yellow' | 'green';

type TrafficLightProps = {
  id: string;
  x: number;
  y: number;
  scale?: number;
  variant?: TrafficLightVariant;
  activeLight?: TrafficLightState;
  collision?: boolean;
};

export default function TrafficLight({
  x,
  y,
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
          transform: [{ scale: finalScale }],
        },
      ]}
    >
      <View style={styles.signalHead}>
        <View style={styles.signalCap} />
        <View style={styles.signalLensWrap}>
          <View style={[styles.lens, styles.redLens, activeLight === 'red' && styles.activeRed]} />
        </View>
        <View style={styles.signalLensWrap}>
          <View style={[styles.lens, styles.yellowLens, activeLight === 'yellow' && styles.activeYellow]} />
        </View>
        <View style={styles.signalLensWrap}>
          <View style={[styles.lens, styles.greenLens, activeLight === 'green' && styles.activeGreen]} />
        </View>
      </View>
      <View style={styles.pole} />
      <View style={styles.base} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 52,
    height: 118,
    alignItems: 'center',
    zIndex: 8,
  },
  signalHead: {
    width: 36,
    height: 66,
    borderRadius: 9,
    backgroundColor: '#111820',
    borderWidth: 3,
    borderColor: '#60707c',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 5,
  },
  signalCap: {
    position: 'absolute',
    top: -8,
    width: 18,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#26343d',
    borderWidth: 2,
    borderColor: '#9aa9b0',
  },
  signalLensWrap: {
    width: 23,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#05070a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#31383e',
  },
  lens: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  redLens: {
    backgroundColor: '#ff2626',
  },
  yellowLens: {
    backgroundColor: '#ffd22e',
  },
  greenLens: {
    backgroundColor: '#42f05f',
  },
  activeRed: {
    shadowColor: '#ff3030',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  activeYellow: {
    shadowColor: '#ffd22e',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  activeGreen: {
    shadowColor: '#42f05f',
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  pole: {
    width: 8,
    height: 38,
    backgroundColor: '#b9c4c9',
    borderLeftWidth: 2,
    borderLeftColor: '#e8f0f2',
    borderRightWidth: 2,
    borderRightColor: '#6d787d',
  },
  base: {
    width: 30,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#1d252b',
    borderWidth: 2,
    borderColor: '#5b666d',
  },
});
