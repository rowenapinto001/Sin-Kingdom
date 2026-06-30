import LocationTile from './LocationTile';
import { worldLocations } from '../worldData';

const location = worldLocations.find((item) => item.id === 'partyPartyYeah');

export default function PartyPartyYeah() {
  if (!location) return null;
  return <LocationTile location={location} />;
}
