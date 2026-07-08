export type AtmospherePhase = 'morning' | 'day' | 'evening' | 'night';

export type AtmospherePhaseConfig = {
  label: string;
  overlayColor: string;
  overlayOpacity: number;
  skyTint: string;
  lightsEnabled: boolean;
  glowColor: string;
  vignetteOpacity: number;
};

export const atmosphereConfig: Record<AtmospherePhase, AtmospherePhaseConfig> = {
  morning: {
    label: 'Morning',
    overlayColor: 'rgba(255, 190, 90, 1)',
    overlayOpacity: 0.12,
    skyTint: '#ffbe5a',
    lightsEnabled: false,
    glowColor: 'rgba(255, 214, 119, 0.32)',
    vignetteOpacity: 0.08,
  },
  day: {
    label: 'Day',
    overlayColor: 'rgba(255, 255, 255, 1)',
    overlayOpacity: 0,
    skyTint: '#ffffff',
    lightsEnabled: false,
    glowColor: 'rgba(255, 255, 255, 0)',
    vignetteOpacity: 0,
  },
  evening: {
    label: 'Evening',
    overlayColor: 'rgba(255, 108, 58, 1)',
    overlayOpacity: 0.22,
    skyTint: '#ff7b48',
    lightsEnabled: true,
    glowColor: 'rgba(255, 197, 88, 0.36)',
    vignetteOpacity: 0.16,
  },
  night: {
    label: 'Night',
    overlayColor: 'rgba(5, 15, 45, 1)',
    overlayOpacity: 0.42,
    skyTint: '#07183f',
    lightsEnabled: true,
    glowColor: 'rgba(255, 202, 96, 0.48)',
    vignetteOpacity: 0.28,
  },
};

export function atmospherePhaseForHour(hour: number): AtmospherePhase {
  if (hour >= 5 && hour <= 10) return 'morning';
  if (hour >= 11 && hour <= 16) return 'day';
  if (hour >= 17 && hour <= 18) return 'evening';
  return 'night';
}
