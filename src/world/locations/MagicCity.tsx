import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'magicCity');

export default function MagicCity() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
