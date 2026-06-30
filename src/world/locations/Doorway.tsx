import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'doorway');

export default function Doorway() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
