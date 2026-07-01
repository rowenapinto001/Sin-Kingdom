import { WorldLocationId } from '../world/worldTypes';

export type AirportDestination = {
  id: WorldLocationId;
  name: string;
  shortName: string;
  restricted?: boolean;
};

export const airportDestinations: AirportDestination[] = [
  { id: 'playerHouse', name: 'Player House', shortName: 'House' },
  { id: 'magicCity', name: 'Magic City', shortName: 'Magic' },
  { id: 'partyPartyYeah', name: 'Party Party Yeah', shortName: 'Party' },
  { id: 'policeStation', name: 'Police Station', shortName: 'Police', restricted: true },
  { id: 'raniRajMahal', name: 'Rani-Raj Mahal', shortName: 'Mahal' },
  { id: 'pinkPalace', name: 'Pink Palace', shortName: 'Palace' },
  { id: 'desert', name: 'Desert', shortName: 'Desert' },
  { id: 'garage', name: 'Garage', shortName: 'Garage' },
  { id: 'roseTemple', name: 'Rose Temple', shortName: 'Temple' },
  { id: 'boatingDock', name: 'Boating Area', shortName: 'Boating' },
  { id: 'clockTower', name: 'Clock Tower', shortName: 'Clock' },
  { id: 'garden', name: 'Garden', shortName: 'Garden' },
  { id: 'doorway', name: 'Doorway', shortName: 'Doorway' },
  { id: 'friendsHouse', name: 'Friends House', shortName: 'Friend' },
];
