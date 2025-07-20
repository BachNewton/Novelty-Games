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
            lat: 60.155143,
            lon: 24.871984
        }
    },
    {
        id: 'GM9G-3VS8-ICFQ-XMSI',
        name: 'Ziggy',
        location: { // Supercell office
            lat: 60.161052,
            lon: 24.921724
        }
    },
    {
        id: '0YHF-2UNI-RY2H-U59U',
        name: 'Ella',
        location: { // Lapinlahden Lähde
            lat: 60.167550,
            lon: 24.913651
        }
    },
    {
        id: 'I6R0-BROC-DVMX-9GKQ',
        name: 'Dorian',
        location: { // Seurasaari
            lat: 60.185826,
            lon: 24.884611
        }
    },
    {
        id: 'K7EJ-VGA0-BNRZ-CZZ8',
        name: 'Baxter',
        location: { // Oodi
            lat: 60.173555,
            lon: 24.937540
        }
    }
];
