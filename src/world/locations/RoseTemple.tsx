import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'roseTemple');

export default function RoseTemple() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
