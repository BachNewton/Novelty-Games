import { Location } from "../logic/LocationService";

interface Pet {
    id: string;
    name: string;
    location: Location;
}

export const ALL_PETS: Pet[] = [
    {
        id: '8GRO-SBWZ-9VBV-47WX',
        name: 'Frog',
        location: { // Lauttasaari Beach
            lat: 60.1593526,
            lon: 24.8685903
        }
    },
    {
        id: 'GM9G-3VS8-ICFQ-XMSI',
        name: 'Ziggy',
        location: { // Supercell office
            lat: 60.1610094,
            lon: 24.9189593
        }
    }
];
