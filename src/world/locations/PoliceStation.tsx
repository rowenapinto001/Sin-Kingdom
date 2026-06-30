import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'policeStation');

export default function PoliceStation() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
