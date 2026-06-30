import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'playerHouse');

export default function PlayerHouse() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
