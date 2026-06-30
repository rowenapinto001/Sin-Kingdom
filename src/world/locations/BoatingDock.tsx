import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'boatingDock');

export default function BoatingDock() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
