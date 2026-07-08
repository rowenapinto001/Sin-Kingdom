import { useEffect, useMemo, useState } from 'react';
import { atmosphereConfig, atmospherePhaseForHour, AtmospherePhase } from '../data/atmosphereConfig';

const INDIA_TIME_ZONE = 'Asia/Kolkata';

type IndianTimeParts = {
  hour: number;
  minute: number;
};

function getIndianTimeParts(): IndianTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: INDIA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return { hour: hour === 24 ? 0 : hour, minute };
}

export function useIndianTimeAtmosphere() {
  const [time, setTime] = useState(getIndianTimeParts);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getIndianTimeParts());
    }, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const phase = useMemo<AtmospherePhase>(() => atmospherePhaseForHour(time.hour), [time.hour]);
  const config = atmosphereConfig[phase];

  return {
    phase,
    hour: time.hour,
    minute: time.minute,
    overlayColor: config.overlayColor,
    overlayOpacity: config.overlayOpacity,
    lightsEnabled: config.lightsEnabled,
    skyTint: config.skyTint,
    glowColor: config.glowColor,
    vignetteOpacity: config.vignetteOpacity,
    label: config.label,
  };
}
