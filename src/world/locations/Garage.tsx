import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'garage');

export default function Garage() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
