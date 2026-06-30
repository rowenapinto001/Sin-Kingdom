import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'pinkPalace');

export default function PinkPalace() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
