import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'raniRajMahal');

export default function RaniRajMahal() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
