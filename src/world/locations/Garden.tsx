import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'garden');

export default function Garden() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
