import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'clockTower');

export default function ClockTower() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
