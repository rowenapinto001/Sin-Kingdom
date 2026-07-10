import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import AirplaneControls from '../../components/AirplaneControls';
import SpriteCharacter from '../../components/SpriteCharacter';
import { airportDestinations } from '../../data/airportDestinations';
import { WORLD_HEIGHT, WORLD_WIDTH } from '../worldData';
import { WorldLocation, WorldLocationId } from '../worldTypes';

type AirplaneFlightProps = {
  destinationId: WorldLocationId;
  worldLocations: WorldLocation[];
  onLand: (destinationId: WorldLocationId) => void;
  onReturnToAirport: () => void;
};

type PlaneState = {
  heading: number;
  speed: number;
  altitude: number;
  fuel: number;
  progress: number;
  airborne: boolean;
  parachuting: boolean;
};

const MAX_ROUTE_PROGRESS = 100;

export default function AirplaneFlight({ destinationId, worldLocations, onLand, onReturnToAirport }: AirplaneFlightProps) {
  const { width, height } = useWindowDimensions();
  const [showMap, setShowMap] = useState(true);
  const [plane, setPlane] = useState<PlaneState>({
    heading: 0,
    speed: 0,
    altitude: 0,
    fuel: 100,
    progress: 0,
    airborne: false,
    parachuting: false,
  });
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const [parachuteStage, setParachuteStage] = useState<'freefall' | 'canopyOpen' | 'glide' | 'landing' | null>(null);

  const selectedDestination = airportDestinations.find((destination) => destination.id === destinationId) ?? airportDestinations[0];
  const routeProgress = Math.min(MAX_ROUTE_PROGRESS, Math.max(0, plane.progress));
  const remainingDistance = Math.max(0, Math.round(100 - routeProgress));
  const canLand = plane.airborne && routeProgress >= 94 && plane.altitude <= 34 && plane.speed <= 115;
  const canParachute = plane.airborne && routeProgress >= 82 && !plane.parachuting;
  const yokeTurn = Math.max(-28, Math.min(28, plane.heading * 0.42));
  const skyShift = -(routeProgress * 7) % Math.max(360, width);
  const cockpitScale = Math.max(0.78, Math.min(1.12, width / 1180));

  const routeMarker = useMemo(() => {
    const location = worldLocations.find((item) => item.id === selectedDestination.id) ?? worldLocations[0];
    return {
      x: 20 + (location.x / WORLD_WIDTH) * 260,
      y: 34 + (location.y / WORLD_HEIGHT) * 126,
    };
  }, [selectedDestination.id, worldLocations]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      setPlane((current) => {
        if (current.parachuting) return current;
        const speed = Math.max(0, current.speed - delta * (current.airborne ? 0.8 : 3.6));
        const fuel = Math.max(0, current.fuel - (current.airborne ? speed * 0.0047 * delta : 0));
        const altitude = current.airborne ? Math.max(0, Math.min(190, current.altitude + Math.max(0, speed - 126) * 0.005 * delta)) : 0;
        const progressGain = current.airborne && fuel > 0 ? speed * 0.039 * delta : 0;

        return {
          ...current,
          speed,
          fuel,
          altitude,
          progress: Math.min(MAX_ROUTE_PROGRESS, current.progress + progressGain),
        };
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
  }, []);

  const updatePlane = (updater: (current: PlaneState) => PlaneState) => setPlane((current) => updater(current));

  const landAtDestination = () => {
    if (!canLand) return;
    onLand(selectedDestination.id);
  };

  const parachuteToDestination = () => {
    if (!canParachute) return;
    updatePlane((current) => ({
      ...current,
      parachuting: true,
      speed: Math.max(38, current.speed * 0.38),
      altitude: Math.max(current.altitude, 78),
      progress: Math.max(current.progress, 94),
    }));
    setParachuteStage('freefall');
    setTimeout(() => setParachuteStage('canopyOpen'), 650);
    setTimeout(() => setParachuteStage('glide'), 1350);
    setTimeout(() => setParachuteStage('landing'), 2300);
    setTimeout(() => onLand(selectedDestination.id), 2950);
  };

  return (
    <View style={styles.root}>
      <View style={styles.outsideSky}>
        <View style={[styles.cloudBand, { transform: [{ translateX: skyShift }] }]} />
        <View style={[styles.cloudBand, styles.cloudBandTwo, { transform: [{ translateX: skyShift * 0.62 }] }]} />
        <View style={styles.distantHorizon}>
          {Array.from({ length: 24 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.horizonTower,
                {
                  height: 28 + ((index * 19) % 72),
                  opacity: 0.28 + ((index % 4) * 0.09),
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.cockpitShell}>
        <View style={styles.ceiling}>
          <View style={styles.ceilingCurveLeft} />
          <View style={styles.ceilingCurveRight} />
          <View style={styles.overheadPanel}>
            {Array.from({ length: 30 }).map((_, index) => (
              <View key={index} style={[styles.overheadSwitch, index % 5 === 0 && styles.overheadSwitchHot]} />
            ))}
          </View>
        </View>

        <View style={styles.sideWindowLeft} />
        <View style={styles.sideWindowRight} />

        <View style={styles.frontWindows}>
          <View style={styles.frontWindow} />
          <View style={styles.centerFrame} />
          <View style={styles.frontWindow} />
          <View style={styles.destinationBeacon}>
            <Text style={styles.beaconSmall}>DESTINATION LOCKED</Text>
            <Text style={styles.beaconTitle}>{selectedDestination.name}</Text>
            <Text style={styles.beaconDistance}>{remainingDistance}% ROUTE LEFT</Text>
          </View>
          <View style={[styles.flightPathLine, { transform: [{ rotate: `${plane.heading * 0.16}deg` }] }]} />
        </View>

        <View style={styles.pilotSeatLeft}>
          <View style={styles.headrest} />
          <View style={styles.seatBase} />
          <SpriteCharacter characterId="victorKane" direction="down" isMoving={false} currentAction="idle" scale={1.04} />
          <Text style={styles.seatName}>BOSS · PASSENGER</Text>
        </View>

        <View style={styles.pilotSeatRight}>
          <View style={styles.headrest} />
          <View style={styles.seatBase} />
          <SpriteCharacter characterId="lunaCrown" direction="down" isMoving={plane.speed > 0} currentAction="idle" scale={1.12} />
          <Text style={styles.seatName}>LUNA CROWN · BODYGUARD PILOT</Text>
        </View>

        <View style={[styles.instrumentDeck, { transform: [{ scale: cockpitScale }] }]}>
          <View style={styles.instrumentWall}>
            {Array.from({ length: 18 }).map((_, index) => (
              <View key={index} style={styles.instrumentDial}>
                <View style={[styles.instrumentNeedle, { transform: [{ rotate: `${(index * 23 + plane.heading) % 180}deg` }] }]} />
              </View>
            ))}
          </View>

          <View style={styles.centerConsole}>
            <View style={styles.consoleScreen}>
              <Text style={styles.consoleTitle}>NAV</Text>
              <Text style={styles.consoleDestination}>{selectedDestination.shortName}</Text>
              <Text style={styles.consoleRoute}>{Math.round(routeProgress)}%</Text>
            </View>
            <View style={styles.throttleQuadrant}>
              <View style={[styles.throttleHandle, { transform: [{ translateY: -Math.min(42, plane.speed / 7) }] }]} />
              <View style={[styles.throttleHandle, styles.throttleHandleBlue, { transform: [{ translateY: -Math.min(36, plane.altitude / 4.5) }] }]} />
            </View>
            <View style={styles.consoleButtons}>
              {Array.from({ length: 16 }).map((_, index) => (
                <View key={index} style={[styles.consoleButton, index % 3 === 0 && styles.consoleButtonLit]} />
              ))}
            </View>
          </View>

          <View style={[styles.yoke, styles.leftYoke]}>
            <View style={styles.yokeColumn} />
            <View style={[styles.yokeWheel, { transform: [{ rotate: `${yokeTurn}deg` }] }]}>
              <View style={styles.yokeHub} />
              <View style={styles.yokeGripLeft} />
              <View style={styles.yokeGripRight} />
            </View>
          </View>
          <View style={[styles.yoke, styles.rightYoke]}>
            <View style={styles.yokeColumn} />
            <View style={[styles.yokeWheel, { transform: [{ rotate: `${yokeTurn}deg` }] }]}>
              <View style={styles.yokeHub} />
              <View style={styles.yokeGripLeft} />
              <View style={styles.yokeGripRight} />
            </View>
            <View style={[styles.pilotHand, styles.leftHand, { transform: [{ rotate: `${-18 + yokeTurn * 0.35}deg` }] }]} />
            <View style={[styles.pilotHand, styles.rightHand, { transform: [{ rotate: `${18 + yokeTurn * 0.35}deg` }] }]} />
          </View>
        </View>
      </View>

      <View style={styles.hud}>
        <Text style={styles.title}>AIRPLANE FLIGHT</Text>
        <Text style={styles.status}>
          Flying to {selectedDestination.name}. {canParachute ? 'Parachute landing ready.' : canLand ? 'Landing zone ready. Slow and LAND.' : 'Use controls to fly toward the beacon.'}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${routeProgress}%` }]} />
        </View>
      </View>

      {showMap ? (
        <View style={styles.destinationMap}>
          <Text style={styles.mapTitle}>WHERE AM I GOING?</Text>
          {airportDestinations.map((destination) => {
            const location = worldLocations.find((item) => item.id === destination.id);
            if (!location) return null;
            const x = 20 + (location.x / WORLD_WIDTH) * 260;
            const y = 34 + (location.y / WORLD_HEIGHT) * 126;
            const selected = destination.id === selectedDestination.id;
            return (
              <View key={destination.id} style={[styles.mapDot, { left: x, top: y }, selected && styles.mapDotSelected]}>
                <Text style={styles.mapDotText}>{destination.shortName}</Text>
              </View>
            );
          })}
          <View style={[styles.routeNeedle, { left: 20 + (routeProgress / 100) * 260, top: routeMarker.y + 10 }]} />
          <View style={[styles.targetRing, { left: routeMarker.x - 8, top: routeMarker.y - 8 }]} />
          <Text style={styles.selectedRouteText}>TARGET: {selectedDestination.name}</Text>
        </View>
      ) : null}

      {plane.parachuting && parachuteStage ? (
        <View style={styles.parachuteOverlay}>
          <Text style={styles.parachuteStageLabel}>
            {parachuteStage === 'freefall' && '1. JUMP — FREEFALL'}
            {parachuteStage === 'canopyOpen' && '2. PARACHUTE OPEN'}
            {parachuteStage === 'glide' && '3. GLIDE'}
            {parachuteStage === 'landing' && '4. LANDING APPROACH'}
          </Text>
          {parachuteStage !== 'freefall' ? (
            <View style={styles.parachuteCanopy}>
              <View style={styles.canopyPanel} />
              <View style={styles.canopyPanelAlt} />
              <View style={styles.canopyPanel} />
            </View>
          ) : null}
          {parachuteStage !== 'freefall' ? <View style={styles.parachuteLines} /> : null}
          <SpriteCharacter
            characterId="lunaCrown"
            direction="down"
            isMoving={parachuteStage === 'glide'}
            currentAction={parachuteStage === 'freefall' ? 'walk' : 'idle'}
            scale={parachuteStage === 'landing' ? 1.3 : 1.12}
          />
          <Text style={styles.parachuteText}>
            {parachuteStage === 'landing' ? `LANDING AT ${selectedDestination.shortName}` : `PARACHUTE TO ${selectedDestination.shortName}`}
          </Text>
        </View>
      ) : null}

      <AirplaneControls
        speed={plane.speed}
        altitude={plane.altitude}
        fuel={plane.fuel}
        airborne={plane.airborne}
        canLand={canLand}
        canParachute={canParachute}
        onThrottle={() => updatePlane((current) => ({ ...current, speed: Math.min(340, current.speed + 34) }))}
        onBrake={() => updatePlane((current) => ({ ...current, speed: Math.max(0, current.speed - 46) }))}
        onTakeoff={() =>
          updatePlane((current) => ({
            ...current,
            airborne: true,
            speed: Math.max(154, current.speed),
            altitude: Math.max(42, current.altitude),
          }))
        }
        onLand={landAtDestination}
        onSteerLeft={() => updatePlane((current) => ({ ...current, heading: Math.max(-65, current.heading - 12) }))}
        onSteerRight={() => updatePlane((current) => ({ ...current, heading: Math.min(65, current.heading + 12) }))}
        onAltitudeUp={() => updatePlane((current) => ({ ...current, airborne: true, altitude: Math.min(190, current.altitude + 18) }))}
        onAltitudeDown={() => updatePlane((current) => ({ ...current, altitude: Math.max(0, current.altitude - 18) }))}
        onParachute={parachuteToDestination}
        onToggleMap={() => setShowMap((value) => !value)}
        onEmergencyReturn={onReturnToAirport}
      />

      <Pressable style={styles.closeButton} onPress={onReturnToAirport}>
        <Text style={styles.closeText}>EMERGENCY STOP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#061428',
    overflow: 'hidden',
  },
  outsideSky: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#7fc8f5',
  },
  cloudBand: {
    position: 'absolute',
    left: 110,
    top: 122,
    width: 520,
    height: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  cloudBandTwo: {
    left: 680,
    top: 202,
    width: 400,
    opacity: 0.7,
  },
  distantHorizon: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: 188,
    height: 104,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  horizonTower: {
    width: 34,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#375f8d',
  },
  cockpitShell: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 24, 43, 0.36)',
  },
  ceiling: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 128,
    backgroundColor: '#07345a',
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
    borderBottomWidth: 4,
    borderColor: '#092033',
  },
  ceilingCurveLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 210,
    height: 142,
    borderBottomRightRadius: 180,
    backgroundColor: '#052844',
  },
  ceilingCurveRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 210,
    height: 142,
    borderBottomLeftRadius: 180,
    backgroundColor: '#052844',
  },
  overheadPanel: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 230,
    height: 104,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f6d9b',
    backgroundColor: '#07111d',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 10,
  },
  overheadSwitch: {
    width: 20,
    height: 9,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#78d7ff',
    backgroundColor: '#10283c',
  },
  overheadSwitchHot: {
    borderColor: '#ffbd28',
    backgroundColor: '#3d240b',
  },
  sideWindowLeft: {
    position: 'absolute',
    left: 22,
    top: 126,
    width: '19%',
    height: '30%',
    borderRadius: 38,
    borderWidth: 9,
    borderColor: '#052844',
    backgroundColor: 'rgba(164, 224, 255, 0.74)',
  },
  sideWindowRight: {
    position: 'absolute',
    right: 22,
    top: 126,
    width: '19%',
    height: '30%',
    borderRadius: 38,
    borderWidth: 9,
    borderColor: '#052844',
    backgroundColor: 'rgba(164, 224, 255, 0.74)',
  },
  frontWindows: {
    position: 'absolute',
    left: '23%',
    right: '23%',
    top: 104,
    height: '34%',
    borderWidth: 9,
    borderColor: '#052844',
    borderBottomWidth: 14,
    borderRadius: 22,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(168, 224, 255, 0.82)',
  },
  frontWindow: {
    flex: 1,
    backgroundColor: 'rgba(144, 210, 248, 0.72)',
  },
  centerFrame: {
    width: 14,
    backgroundColor: '#052844',
  },
  destinationBeacon: {
    position: 'absolute',
    alignSelf: 'center',
    top: 24,
    minWidth: 188,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffbd28',
    backgroundColor: 'rgba(4, 5, 12, 0.66)',
  },
  beaconSmall: {
    color: '#8ee8ff',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  beaconTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 7,
  },
  beaconDistance: {
    color: '#ffbd28',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  flightPathLine: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 16,
    width: 260,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#ff2e8a',
    shadowColor: '#ff2e8a',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  pilotSeatLeft: {
    position: 'absolute',
    left: 36,
    bottom: 82,
    width: 132,
    height: 190,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pilotSeatRight: {
    position: 'absolute',
    right: 40,
    bottom: 82,
    width: 142,
    height: 198,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headrest: {
    position: 'absolute',
    top: 0,
    width: 94,
    height: 74,
    borderRadius: 28,
    backgroundColor: '#061421',
    borderWidth: 2,
    borderColor: '#183f5d',
  },
  seatBase: {
    position: 'absolute',
    bottom: 0,
    width: 118,
    height: 112,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#082136',
    borderWidth: 2,
    borderColor: '#174768',
  },
  seatName: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 5,
  },
  instrumentDeck: {
    position: 'absolute',
    left: '23%',
    right: '23%',
    bottom: -4,
    height: 224,
  },
  instrumentWall: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 92,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderWidth: 3,
    borderColor: '#0d4666',
    backgroundColor: '#07111d',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  instrumentDial: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#8ee8ff',
    backgroundColor: '#02050d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instrumentNeedle: {
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: '#ffbd28',
  },
  centerConsole: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    width: 178,
    height: 154,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: '#0d4666',
    backgroundColor: '#07111d',
    alignItems: 'center',
    paddingTop: 10,
  },
  consoleScreen: {
    width: 104,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8ee8ff',
    backgroundColor: '#031a21',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consoleTitle: {
    color: '#8ee8ff',
    fontSize: 8,
    fontWeight: '900',
  },
  consoleDestination: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  consoleRoute: {
    color: '#ffbd28',
    fontSize: 10,
    fontWeight: '900',
  },
  throttleQuadrant: {
    marginTop: 9,
    width: 76,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#375f8d',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    alignItems: 'flex-end',
  },
  throttleHandle: {
    width: 10,
    height: 46,
    borderRadius: 6,
    backgroundColor: '#ffbd28',
  },
  throttleHandleBlue: {
    backgroundColor: '#8ee8ff',
  },
  consoleButtons: {
    marginTop: 8,
    width: 112,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  },
  consoleButton: {
    width: 16,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#183f5d',
  },
  consoleButtonLit: {
    backgroundColor: '#ff2e8a',
  },
  yoke: {
    position: 'absolute',
    width: 120,
    height: 116,
    alignItems: 'center',
  },
  leftYoke: {
    left: 52,
    bottom: 50,
  },
  rightYoke: {
    right: 52,
    bottom: 50,
  },
  yokeColumn: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 70,
    borderRadius: 9,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#375f8d',
  },
  yokeWheel: {
    position: 'absolute',
    top: 0,
    width: 112,
    height: 72,
    borderRadius: 36,
    borderWidth: 10,
    borderColor: '#050912',
    backgroundColor: 'rgba(142, 232, 255, 0.1)',
  },
  yokeHub: {
    position: 'absolute',
    left: 41,
    top: 21,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffbd28',
  },
  yokeGripLeft: {
    position: 'absolute',
    left: -10,
    top: 22,
    width: 28,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#050912',
  },
  yokeGripRight: {
    position: 'absolute',
    right: -10,
    top: 22,
    width: 28,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#050912',
  },
  pilotHand: {
    position: 'absolute',
    top: 34,
    width: 46,
    height: 13,
    borderRadius: 8,
    backgroundColor: '#9b5935',
    borderWidth: 1,
    borderColor: '#ffd2ad',
  },
  leftHand: {
    left: 6,
  },
  rightHand: {
    right: 6,
  },
  hud: {
    position: 'absolute',
    left: 16,
    top: 14,
    width: 400,
    maxWidth: '45%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(4, 4, 14, 0.82)',
    borderWidth: 2,
    borderColor: '#ffbd28',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 8,
  },
  status: {
    marginTop: 4,
    color: '#fbe6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    marginTop: 9,
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ffbd28',
  },
  destinationMap: {
    position: 'absolute',
    left: 16,
    top: 118,
    width: 304,
    height: 206,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(7, 5, 20, 0.86)',
  },
  mapTitle: {
    position: 'absolute',
    left: 12,
    top: 8,
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  mapDot: {
    position: 'absolute',
    minWidth: 34,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#1c1630',
    borderWidth: 1,
    borderColor: '#ff2e8a',
  },
  mapDotSelected: {
    backgroundColor: '#ffbd28',
    borderColor: '#fff0a6',
  },
  mapDotText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
  },
  routeNeedle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#ff2e8a',
  },
  targetRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#ffbd28',
  },
  selectedRouteText: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    right: 12,
    color: '#ffbd28',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  parachuteOverlay: {
    position: 'absolute',
    left: '43%',
    top: '24%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 5, 16, 0.46)',
  },
  parachuteCanopy: {
    width: 112,
    height: 46,
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#fff',
  },
  canopyPanel: {
    flex: 1,
    backgroundColor: '#ff2e8a',
  },
  canopyPanelAlt: {
    flex: 1,
    backgroundColor: '#ffbd28',
  },
  parachuteLines: {
    width: 74,
    height: 46,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#fff',
  },
  parachuteText: {
    marginTop: 4,
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: '#ff2e8a',
    textShadowRadius: 8,
  },
  parachuteStageLabel: {
    marginBottom: 6,
    color: '#ffbd28',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: 'rgba(12, 12, 18, 0.82)',
    borderWidth: 1,
    borderColor: '#ff2e8a',
  },
  closeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
});
