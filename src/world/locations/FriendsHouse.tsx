import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'friendsHouse');

export default function FriendsHouse() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
