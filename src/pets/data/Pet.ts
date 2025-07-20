import { Location } from "../logic/LocationService";

interface Pet {
    name: string;
    location: Location;
}

export const pets: Pet[] = [
    {
        name: 'Frog',
        location: { // Lauttasaari Beach
            lat: 60.1593526,
            lon: 24.8685903
        }
    },
    {
        name: 'Ziggy',
        location: { // Supercell office
            lat: 60.1610094,
            lon: 24.9189593
        }
    }
];
