import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'desert');

export default function Desert() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
