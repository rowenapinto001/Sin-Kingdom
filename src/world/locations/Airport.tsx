import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'airport');

export default function Airport() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
