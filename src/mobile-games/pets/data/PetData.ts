import { Location } from "../../../util/geolocation/LocationService";
import { baxterDialog, Dialogue, doryDialog, ellaDialog, frogDialog, ziggyDialog } from "./Dialogue";
import { baxterInteractions, doryInteractions, ellaInteractions, frogInteractions, Interactions, ziggyInteractions } from "./Interaction";
import { jätkäsaariPark, lapinlahdenLähde, lauttasaariBeach, oodi, seurasaari } from "./Locations";
import { defaultImages, frogImages, PetImages, ziggyImages } from "./PetImages";

export interface PetData {
    id: string;
    name: string;
    location: Location;
    dialogue: Dialogue;
    interactions: Interactions;
    images: PetImages;
}

export const PET_DATA: PetData[] = [
    {
        id: '8GRO-SBWZ-9VBV-47WX',
        name: 'Frog',
        location: lauttasaariBeach,
        dialogue: frogDialog,
        interactions: frogInteractions,
        images: frogImages
    },
    {
        id: 'GM9G-3VS8-ICFQ-XMSI',
        name: 'Ziggy',
        location: jätkäsaariPark,
        dialogue: ziggyDialog,
        interactions: ziggyInteractions,
        images: ziggyImages
    },
    {
        id: 'K7EJ-VGA0-BNRZ-CZZ8',
        name: 'Baxter',
        location: oodi,
        dialogue: baxterDialog,
        interactions: baxterInteractions,
        images: defaultImages
    },
    {
        id: '0YHF-2UNI-RY2H-U59U',
        name: 'Ella',
        location: lapinlahdenLähde,
        dialogue: ellaDialog,
        interactions: ellaInteractions,
        images: defaultImages
    },
    {
        id: 'I6R0-BROC-DVMX-9GKQ',
        name: 'Dory',
        location: seurasaari,
        dialogue: doryDialog,
        interactions: doryInteractions,
        images: defaultImages
    },
    // {
    //     id: '7BUR-NBXS-YK4L-DQFF',
    //     name: 'Nissa',
    //     location: { // Pihlajasaari
    //         lat: 60.140322,
    //         lon: 24.916174
    //     },
    //     dialogue: getDefaultDialogue()
    // },
    // {
    //     id: 'FAFK-YR7G-YJKE-QZTG',
    //     name: 'Charlemagne',
    //     location: { // Senate Square
    //         lat: 60.169639,
    //         lon: 24.952259
    //     },
    //     dialogue: getDefaultDialogue()
    // },
    // {
    //     id: 'GA9X-D1BP-N28O-O7FA',
    //     name: 'Prinsessa',
    //     location: { // Friend's home in Lahti
    //         lat: 60.979645,
    //         lon: 25.708814
    //     },
    //     dialogue: getDefaultDialogue()
    // },
    // {
    //     id: 'KGUP-HUGJ-71PR-PEB0',
    //     name: 'Viola',
    //     location: { // Lahi train station
    //         lat: 60.976995,
    //         lon: 25.657639
    //     },
    //     dialogue: getDefaultDialogue()
    // }
];

// ----- Location Ideas -----
// Cafe Regatta
// Helsinki Winter Garden
// Veijarivuoren ranta: 60.146393, 24.882560
// Persilja Restaurant: 60.157827, 24.880785
// Elliott's Office: 60.156316, 24.885009
// HSK Docks: 60.152068, 24.891240

export const PET_DATA_MAP = new Map(PET_DATA.map(pet => [pet.id, pet]));
