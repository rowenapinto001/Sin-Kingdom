import { StyleSheet, Text, View } from 'react-native';
import SpriteCharacter from './SpriteCharacter';

type BoatVehicleProps = {
  heading: number;
  speed: number;
};

export default function BoatVehicle({ heading, speed }: BoatVehicleProps) {
  return (
    <View style={[styles.root, { transform: [{ rotate: `${heading}deg` }] }]}>
      <View style={[styles.wake, { opacity: speed > 8 ? 0.7 : 0.22 }]} />
      <View style={styles.hull}>
        <View style={styles.nose} />
        <View style={styles.deck}>
          <View style={styles.seat}>
            <SpriteCharacter characterId="lunaCrown" direction="down" isMoving={speed > 12} currentAction="idle" scale={0.82} />
            <Text style={styles.seatLabel}>Luna</Text>
          </View>
          <View style={styles.wheel}>
            <View style={styles.wheelHub} />
          </View>
          <View style={styles.seat}>
            <SpriteCharacter characterId="victorKane" direction="down" isMoving={false} currentAction="idle" scale={0.72} />
            <Text style={styles.seatLabel}>Boss</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 102,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wake: {
    position: 'absolute',
    left: -34,
    width: 56,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(225,255,255,0.72)',
  },
  hull: {
    width: 94,
    height: 44,
    borderRadius: 28,
    backgroundColor: '#f3b733',
    borderWidth: 4,
    borderColor: '#fff1ae',
    shadowColor: '#00131c',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  nose: {
    position: 'absolute',
    right: -12,
    top: 6,
    width: 31,
    height: 29,
    borderRadius: 18,
    backgroundColor: '#ef6d31',
    borderWidth: 3,
    borderColor: '#fff1ae',
  },
  deck: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 7,
  },
  seat: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatLabel: {
    marginTop: -7,
    color: '#111',
    fontSize: 8,
    fontWeight: '900',
  },
  wheel: {
    width: 20,
    height: 20,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#2d190c',
    backgroundColor: '#9b671f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelHub: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff0ad',
  },
});
