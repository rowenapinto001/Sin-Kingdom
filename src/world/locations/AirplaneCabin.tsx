import { Pressable, StyleSheet, Text, View } from 'react-native';
import SpriteCharacter from '../../components/SpriteCharacter';
import { AirportDestination } from '../../data/airportDestinations';

type AirplaneCabinProps = {
  destination: AirportDestination;
  onStartFlight: () => void;
  onBack: () => void;
};

export default function AirplaneCabin({ destination, onStartFlight, onBack }: AirplaneCabinProps) {
  return (
    <View style={styles.root}>
      <View style={styles.cabinBody}>
        <View style={styles.windowRow}>
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index} style={styles.window} />
          ))}
        </View>
        <View style={styles.cockpit}>
          <Text style={styles.cockpitTitle}>COCKPIT</Text>
          <View style={styles.instrumentRow}>
            <View style={styles.instrument} />
            <View style={styles.instrument} />
            <View style={styles.instrumentWide} />
          </View>
        </View>
        <View style={styles.seatRow}>
          <View style={styles.seat}>
            <SpriteCharacter characterId="lunaCrown" direction="down" isMoving={false} currentAction="idle" scale={1.55} />
            <Text style={styles.seatText}>Luna Crown</Text>
          </View>
          <View style={styles.seat}>
            <SpriteCharacter characterId="victorKane" direction="down" isMoving={false} currentAction="idle" scale={1.42} />
            <Text style={styles.seatText}>Boss</Text>
          </View>
          <View style={styles.flightPlan}>
            <Text style={styles.flightPlanTitle}>FLIGHT PLAN</Text>
            <Text style={styles.flightPlanText}>Destination: {destination.name}</Text>
            <Text style={styles.flightPlanText}>Passengers checked. Cabin sealed. Parachutes ready.</Text>
            <Text style={styles.flightPlanHint}>Press START FLIGHT to open the full aeroplane control system.</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={onStartFlight}>
          <Text style={styles.primaryText}>START FLIGHT</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryText}>BACK TO AIRPORT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 14,
    gap: 12,
    backgroundColor: '#090b18',
  },
  cabinBody: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#8ee8ff',
    backgroundColor: '#1b263f',
    overflow: 'hidden',
    shadowColor: '#8ee8ff',
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  windowRow: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#11182c',
  },
  window: {
    width: 54,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#75d8ff',
    borderWidth: 2,
    borderColor: '#d7f7ff',
  },
  cockpit: {
    margin: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffbd28',
    backgroundColor: '#0d1020',
  },
  cockpitTitle: {
    color: '#ffbd28',
    fontSize: 18,
    fontWeight: '900',
  },
  instrumentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  instrument: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#18283f',
    borderWidth: 2,
    borderColor: '#8ee8ff',
  },
  instrumentWide: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#18283f',
    borderWidth: 2,
    borderColor: '#ff2e8a',
  },
  seatRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-end',
    padding: 16,
  },
  seat: {
    width: 128,
    height: 132,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 16,
    backgroundColor: '#10172a',
    borderWidth: 2,
    borderColor: '#ff2e8a',
    overflow: 'hidden',
  },
  seatText: {
    paddingBottom: 8,
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  flightPlan: {
    flex: 1,
    minHeight: 120,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffbd28',
    backgroundColor: '#160a18',
    justifyContent: 'center',
  },
  flightPlanTitle: {
    color: '#ffbd28',
    fontSize: 18,
    fontWeight: '900',
  },
  flightPlanText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  flightPlanHint: {
    marginTop: 10,
    color: '#ffbd28',
    fontSize: 13,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#ffbd28',
    borderWidth: 2,
    borderColor: '#fff0a6',
  },
  primaryText: {
    color: '#120600',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: 'rgba(12, 12, 18, 0.86)',
    borderWidth: 1,
    borderColor: '#ff2e8a',
  },
  secondaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
});
