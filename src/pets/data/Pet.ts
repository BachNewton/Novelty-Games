import { Location } from "../logic/LocationService";

interface Pet {
    name: string;
    location: Location;
}

export const frog: Pet = {
    name: 'Frog',
    location: { // Lauttasaari Beach
        lat: 60.1593526,
        lon: 24.8685903
    }
};
