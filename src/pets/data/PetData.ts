import { Location } from "../logic/LocationService";
import { Dialogue, doryDialog, ellaDialog, getDefaultDialogue } from "./Dialogue";

interface PetData {
    id: string;
    name: string;
    location: Location;
    dialogue: Dialogue;
}

export const PET_DATA: PetData[] = [
    {
        id: '8GRO-SBWZ-9VBV-47WX',
        name: 'Frog',
        location: { // Lauttasaari Beach
            lat: 60.155143,
            lon: 24.871984
        },
        dialogue: getDefaultDialogue()
    },
    {
        id: 'GM9G-3VS8-ICFQ-XMSI',
        name: 'Ziggy',
        location: { // Supercell office
            lat: 60.161052,
            lon: 24.921724
        },
        dialogue: getDefaultDialogue()
    },
    {
        id: '0YHF-2UNI-RY2H-U59U',
        name: 'Ella',
        location: { // Lapinlahden Lähde
            lat: 60.167550,
            lon: 24.913651
        },
        dialogue: ellaDialog
    },
    {
        id: 'I6R0-BROC-DVMX-9GKQ',
        name: 'Dory',
        location: { // Seurasaari
            lat: 60.185826,
            lon: 24.884611
        },
        dialogue: doryDialog
    },
    {
        id: 'K7EJ-VGA0-BNRZ-CZZ8',
        name: 'Baxter',
        location: { // Oodi
            lat: 60.173555,
            lon: 24.937540
        },
        dialogue: getDefaultDialogue()
    },
    {
        id: '7BUR-NBXS-YK4L-DQFF',
        name: 'Nissa',
        location: { // Pihlajasaari
            lat: 60.140322,
            lon: 24.916174
        },
        dialogue: getDefaultDialogue()
    },
    {
        id: 'FAFK-YR7G-YJKE-QZTG',
        name: 'Charlemagne',
        location: { // Senate Square
            lat: 60.169639,
            lon: 24.952259
        },
        dialogue: getDefaultDialogue()
    },
    {
        id: 'GA9X-D1BP-N28O-O7FA',
        name: 'Prinsessa',
        location: { // Friend's home in Lahti
            lat: 60.979645,
            lon: 25.708814
        },
        dialogue: getDefaultDialogue()
    },
    {
        id: 'KGUP-HUGJ-71PR-PEB0',
        name: 'Viola',
        location: { // Lahi train station
            lat: 60.976995,
            lon: 25.657639
        },
        dialogue: getDefaultDialogue()
    }
];

export const PET_DATA_MAP = new Map(PET_DATA.map(pet => [pet.id, pet]));
