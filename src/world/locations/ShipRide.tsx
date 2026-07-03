import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import SpriteCharacter from '../../components/SpriteCharacter';

type ShipSide = 'west' | 'east';

type ShipRideProps = {
  startSide: ShipSide;
  onDock: (side: ShipSide) => void;
  onReturn: () => void;
};

type ShipState = {
  x: number;
  y: number;
  speed: number;
  heading: number;
  progress: number;
  fuel: number;
};

const MAX_PROGRESS = 100;

export default function ShipRide({ startSide, onDock, onReturn }: ShipRideProps) {
  const { width, height } = useWindowDimensions();
  const targetSide: ShipSide = startSide === 'west' ? 'east' : 'west';
  const directionMultiplier = startSide === 'west' ? 1 : -1;
  const routeLabel = `${startSide.toUpperCase()} DOCK -> ${targetSide.toUpperCase()} DOCK`;
  const [ship, setShip] = useState<ShipState>({
    x: startSide === 'west' ? width * 0.18 : width * 0.72,
    y: height * 0.38,
    speed: 0,
    heading: startSide === 'west' ? 0 : 180,
    progress: 0,
    fuel: 100,
  });
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const canDock = ship.progress >= 92 && ship.speed <= 34;
  const riverShift = -(ship.progress * 5) % Math.max(width, 700);
  const routeX = `${Math.min(94, Math.max(6, ship.progress))}%` as `${number}%`;

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      setShip((current) => {
        const speed = Math.max(0, current.speed - delta * 1.65);
        const fuel = Math.max(0, current.fuel - speed * 0.006 * delta);
        const progressGain = fuel > 0 ? speed * 0.03 * delta : 0;
        const progress = Math.min(MAX_PROGRESS, current.progress + progressGain);
        const startX = startSide === 'west' ? width * 0.17 : width * 0.74;
        const targetX = startSide === 'west' ? width * 0.74 : width * 0.17;
        const x = startX + (targetX - startX) * (progress / MAX_PROGRESS);
        const bob = Math.sin(timestamp / 240) * Math.min(8, speed / 12);

        return {
          ...current,
          x,
          y: height * 0.38 + bob,
          speed,
          fuel,
          progress,
        };
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
  }, [height, startSide, width]);

  const updateShip = (updater: (current: ShipState) => ShipState) => setShip((current) => updater(current));

  const throttle = () => updateShip((current) => ({ ...current, speed: Math.min(96, current.speed + 16), fuel: Math.max(0, current.fuel - 0.4) }));
  const brake = () => updateShip((current) => ({ ...current, speed: Math.max(0, current.speed - 20) }));
  const steerLeft = () => updateShip((current) => ({ ...current, heading: Math.max(-32, current.heading - 8 * directionMultiplier) }));
  const steerRight = () => updateShip((current) => ({ ...current, heading: Math.min(212, current.heading + 8 * directionMultiplier) }));
  const dock = () => {
    if (canDock) onDock(targetSide);
  };

  return (
    <View style={styles.root}>
      <View style={styles.river}>
        <View style={[styles.waterHighlight, { transform: [{ translateX: riverShift }] }]} />
        <View style={[styles.waterHighlight, styles.waterHighlightTwo, { transform: [{ translateX: riverShift * 0.55 }] }]} />
        {Array.from({ length: 30 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.lily,
              {
                left: (index * 118 + 36) % Math.max(width, 820),
                top: 95 + (index % 5) * 72,
                opacity: 0.44 + (index % 4) * 0.11,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.leftBank}>
        <Text style={styles.bankText}>{startSide === 'west' ? 'START DOCK' : 'TARGET DOCK'}</Text>
      </View>
      <View style={styles.rightBank}>
        <Text style={styles.bankText}>{startSide === 'east' ? 'START DOCK' : 'TARGET DOCK'}</Text>
      </View>

      <View style={styles.bridgePreview}>
        <View style={styles.bridgeRoad} />
        <View style={styles.bridgeRailTop} />
        <View style={styles.bridgeRailBottom} />
        <Text style={styles.bridgeText}>BRIDGE ABOVE - WATER ROUTE BELOW</Text>
      </View>

      <View style={styles.routeHud}>
        <Text style={styles.title}>SHIP RIDE</Text>
        <Text style={styles.status}>Route: {routeLabel}</Text>
        <Text style={styles.guidance}>{canDock ? 'Slow down and press DOCK SHIP.' : `Go toward the ${targetSide.toUpperCase()} dock. Keep the boat in the river lane.`}</Text>
        <View style={styles.routeTrack}>
          <View style={styles.routeLine} />
          <View style={styles.routeStartDot} />
          <View style={styles.routeEndDot} />
          <View style={[styles.routeBoatDot, { left: routeX }]} />
        </View>
      </View>

      <MiniRiverMap startSide={startSide} targetSide={targetSide} progress={ship.progress} />

      <View
        style={[
          styles.mapShip,
          {
            left: ship.x,
            top: ship.y,
            transform: [{ rotate: `${ship.heading}deg` }],
          },
        ]}
      >
        <View style={styles.mapShipWake} />
        <View style={styles.mapShipHull}>
          <View style={styles.mapShipNose} />
          <View style={styles.mapShipCabin} />
        </View>
      </View>

      <View style={styles.boatCockpit}>
        <View style={styles.boatBow} />
        <View style={styles.cabinWindow}>
          <Text style={styles.windowRoute}>{routeLabel}</Text>
          <View style={styles.windowRiverLine}>
            <View style={[styles.windowBoatMarker, { left: routeX }]} />
          </View>
          <Text style={styles.windowHint}>{canDock ? 'TARGET DOCK IN RANGE' : `TARGET: ${targetSide.toUpperCase()} DOCK`}</Text>
        </View>
        <View style={styles.seatLeft}>
          <SpriteCharacter characterId="lunaCrown" direction="down" isMoving={ship.speed > 8} currentAction="idle" scale={1.05} />
          <Text style={styles.seatLabel}>Pilot</Text>
        </View>
        <View style={styles.seatRight}>
          <SpriteCharacter characterId="victorKane" direction="down" isMoving={false} currentAction="idle" scale={0.96} />
          <Text style={styles.seatLabel}>Boss</Text>
        </View>
        <View style={styles.wheel}>
          <View style={styles.wheelRing} />
          <View style={styles.wheelHub} />
        </View>
        <View style={styles.console}>
          <View style={styles.statRow}>
            <Text style={styles.stat}>SPD {Math.round(ship.speed)}</Text>
            <Text style={styles.stat}>FUEL {Math.round(ship.fuel)}%</Text>
            <Text style={styles.stat}>ROUTE {Math.round(ship.progress)}%</Text>
          </View>
          <View style={styles.controlGrid}>
            <ControlButton label="THROTTLE" onPress={throttle} />
            <ControlButton label="BRAKE" onPress={brake} />
            <ControlButton label="STEER LEFT" onPress={steerLeft} />
            <ControlButton label="STEER RIGHT" onPress={steerRight} />
            <ControlButton label={canDock ? 'DOCK SHIP' : 'DOCK LOCKED'} onPress={dock} disabled={!canDock} accent />
            <ControlButton label="RETURN" onPress={onReturn} />
          </View>
        </View>
      </View>
    </View>
  );
}

function MiniRiverMap({ startSide, targetSide, progress }: { startSide: ShipSide; targetSide: ShipSide; progress: number }) {
  const routeX = `${Math.min(92, Math.max(8, progress))}%` as `${number}%`;
  return (
    <View style={styles.miniMap}>
      <Text style={styles.miniTitle}>RIVER ROUTE</Text>
      <View style={styles.miniRiver}>
        <View style={styles.miniBridge} />
        <View style={styles.miniRouteLine} />
        <View style={[styles.miniDock, styles.miniDockLeft]}>
          <Text style={styles.miniDockText}>{startSide === 'west' ? 'START' : 'TARGET'}</Text>
        </View>
        <View style={[styles.miniDock, styles.miniDockRight]}>
          <Text style={styles.miniDockText}>{targetSide === 'east' ? 'TARGET' : 'START'}</Text>
        </View>
        <View style={[styles.miniBoat, { left: routeX }]} />
      </View>
      <View style={styles.miniLegendRow}>
        <Text style={styles.miniLegend}>Start: {startSide.toUpperCase()}</Text>
        <Text style={styles.miniLegend}>Go: {targetSide.toUpperCase()}</Text>
      </View>
    </View>
  );
}

function ControlButton({ label, onPress, disabled = false, accent = false }: { label: string; onPress: () => void; disabled?: boolean; accent?: boolean }) {
  return (
    <Pressable style={[styles.controlButton, accent && styles.controlButtonAccent, disabled && styles.controlButtonDisabled]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.controlText, accent && styles.controlTextAccent, disabled && styles.controlTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#062135',
    overflow: 'hidden',
  },
  river: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#076f95',
  },
  waterHighlight: {
    position: 'absolute',
    left: -520,
    right: -520,
    top: 118,
    height: 74,
    borderRadius: 999,
    backgroundColor: 'rgba(145,235,255,0.23)',
  },
  waterHighlightTwo: {
    top: 360,
    height: 58,
    backgroundColor: 'rgba(226,255,255,0.18)',
  },
  lily: {
    position: 'absolute',
    width: 34,
    height: 19,
    borderRadius: 18,
    backgroundColor: '#3e9151',
    borderWidth: 1,
    borderColor: '#a6db70',
  },
  leftBank: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 86,
    backgroundColor: '#216f35',
    borderRightWidth: 5,
    borderRightColor: '#ddc573',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightBank: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 86,
    backgroundColor: '#216f35',
    borderLeftWidth: 5,
    borderLeftColor: '#ddc573',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankText: {
    color: '#fff3bd',
    fontSize: 12,
    fontWeight: '900',
    transform: [{ rotate: '-90deg' }],
    width: 128,
    textAlign: 'center',
  },
  bridgePreview: {
    position: 'absolute',
    left: '16%',
    right: '16%',
    top: '16%',
    height: 112,
    alignItems: 'center',
  },
  bridgeRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 42,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#20242c',
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderColor: '#9b8b6c',
  },
  bridgeRailTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
    height: 22,
    backgroundColor: '#8a7a61',
    borderColor: '#d2bd7d',
    borderWidth: 2,
  },
  bridgeRailBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 86,
    height: 22,
    backgroundColor: '#8a7a61',
    borderColor: '#d2bd7d',
    borderWidth: 2,
  },
  bridgeText: {
    marginTop: 3,
    color: '#fff4c2',
    fontSize: 14,
    fontWeight: '900',
  },
  routeHud: {
    position: 'absolute',
    left: 24,
    top: 22,
    width: 430,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 9, 22, 0.86)',
    borderWidth: 3,
    borderColor: '#ff2e8a',
  },
  title: {
    color: '#ffffff',
    fontSize: 31,
    fontWeight: '900',
  },
  status: {
    marginTop: 8,
    color: '#f8d9ff',
    fontSize: 16,
    fontWeight: '900',
  },
  guidance: {
    marginTop: 5,
    color: '#fff2b8',
    fontSize: 13,
    fontWeight: '800',
  },
  routeTrack: {
    marginTop: 12,
    height: 24,
    justifyContent: 'center',
  },
  routeLine: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#ffc334',
  },
  routeStartDot: {
    position: 'absolute',
    left: 0,
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#61f970',
    borderWidth: 2,
    borderColor: '#fff',
  },
  routeEndDot: {
    position: 'absolute',
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#ff3345',
    borderWidth: 2,
    borderColor: '#fff',
  },
  routeBoatDot: {
    position: 'absolute',
    width: 24,
    height: 14,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: '#8ff0ff',
    borderWidth: 2,
    borderColor: '#06101d',
  },
  miniMap: {
    position: 'absolute',
    right: 20,
    top: 22,
    width: 290,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 9, 16, 0.88)',
    borderWidth: 3,
    borderColor: '#ffc334',
  },
  miniTitle: {
    color: '#ff4aa0',
    fontSize: 19,
    fontWeight: '900',
  },
  miniRiver: {
    marginTop: 10,
    height: 112,
    borderRadius: 12,
    backgroundColor: '#0b7696',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7ae6ff',
  },
  miniBridge: {
    position: 'absolute',
    left: 110,
    top: 0,
    bottom: 0,
    width: 42,
    backgroundColor: '#93866e',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#dcc889',
  },
  miniRouteLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 54,
    height: 6,
    borderRadius: 8,
    backgroundColor: '#fff0a8',
  },
  miniDock: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#121822',
    borderWidth: 2,
    borderColor: '#ff2e8a',
  },
  miniDockLeft: {
    left: 8,
  },
  miniDockRight: {
    right: 8,
  },
  miniDockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  miniBoat: {
    position: 'absolute',
    top: 47,
    width: 30,
    height: 18,
    marginLeft: -15,
    borderRadius: 14,
    backgroundColor: '#ffc334',
    borderWidth: 2,
    borderColor: '#fff4bd',
  },
  miniLegendRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniLegend: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  mapShip: {
    position: 'absolute',
    width: 138,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapShipWake: {
    position: 'absolute',
    left: -42,
    width: 70,
    height: 17,
    borderRadius: 999,
    backgroundColor: 'rgba(224,255,255,0.56)',
  },
  mapShipHull: {
    width: 118,
    height: 52,
    borderRadius: 30,
    backgroundColor: '#e9b23d',
    borderWidth: 4,
    borderColor: '#fff0ad',
  },
  mapShipNose: {
    position: 'absolute',
    right: -15,
    top: 7,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#f06c2e',
    borderWidth: 3,
    borderColor: '#fff0ad',
  },
  mapShipCabin: {
    position: 'absolute',
    left: 42,
    top: 10,
    width: 33,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#7ce7ff',
    borderWidth: 2,
    borderColor: '#ddfbff',
  },
  boatCockpit: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: 14,
    height: 248,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: '#5d3d22',
    borderWidth: 4,
    borderColor: '#f4c35c',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    overflow: 'hidden',
  },
  boatBow: {
    position: 'absolute',
    left: '34%',
    right: '34%',
    top: -28,
    height: 88,
    borderRadius: 80,
    backgroundColor: '#8d5a28',
    borderWidth: 4,
    borderColor: '#f4c35c',
  },
  cabinWindow: {
    position: 'absolute',
    left: 24,
    top: 18,
    width: 260,
    height: 82,
    borderRadius: 18,
    backgroundColor: '#0a3140',
    borderWidth: 3,
    borderColor: '#8ff0ff',
    padding: 10,
  },
  windowRoute: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  windowRiverLine: {
    marginTop: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#0b86a8',
  },
  windowBoatMarker: {
    position: 'absolute',
    top: -5,
    width: 22,
    height: 18,
    marginLeft: -11,
    borderRadius: 12,
    backgroundColor: '#ffc334',
    borderWidth: 2,
    borderColor: '#fff4bd',
  },
  windowHint: {
    marginTop: 10,
    color: '#fff2b8',
    fontSize: 12,
    fontWeight: '900',
  },
  seatLeft: {
    position: 'absolute',
    left: 306,
    top: 22,
    alignItems: 'center',
  },
  seatRight: {
    position: 'absolute',
    left: 382,
    top: 25,
    alignItems: 'center',
  },
  seatLabel: {
    marginTop: -5,
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  wheel: {
    position: 'absolute',
    left: 482,
    top: 40,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#26150b',
    backgroundColor: '#b77c28',
  },
  wheelHub: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#fff0ad',
  },
  console: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(9,7,14,0.86)',
    borderWidth: 2,
    borderColor: '#ff2e8a',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    color: '#8ff0ff',
    fontSize: 15,
    fontWeight: '900',
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  controlButton: {
    width: 116,
    height: 40,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18091a',
  },
  controlButtonAccent: {
    backgroundColor: '#ffc334',
    borderColor: '#fff0ad',
  },
  controlButtonDisabled: {
    opacity: 0.42,
  },
  controlText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  controlTextAccent: {
    color: '#120b05',
  },
  controlTextDisabled: {
    color: '#b2aab5',
  },
});
