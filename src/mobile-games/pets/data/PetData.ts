import { Location } from "../../../util/geolocation/LocationService";
import { albyDialog, baxterDialog, Dialogue, doryDialog, ellaDialog, frogDialog, lenoreDialog, nissaDialog, ziggyDialog } from "./Dialogue";
import { albyInteractions, baxterInteractions, doryInteractions, ellaInteractions, frogInteractions, Interactions, lenoreInteractions, nissaInteractions, ziggyInteractions } from "./Interaction";
import { cafeRegatta, helsinkiWinterGarden, jätkäsaariPark, lapinlahdenLähde, lauttasaariBeach, lionStatueHelsinki, oodi, seurasaari } from "./Locations";
import { albyImages, defaultImages, doryImages, ellaImages, frogImages, lenoreImages, nissaImages, PetImages, ziggyImages } from "./PetImages";

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
        id: '67R2-XJ9A-S3GL-SKYN',
        name: 'Ella',
        location: lapinlahdenLähde,
        dialogue: ellaDialog,
        interactions: ellaInteractions,
        images: ellaImages
    },
    {
        id: 'O65A-EIAT-P85Q-9AP4',
        name: 'Dory',
        location: seurasaari,
        dialogue: doryDialog,
        interactions: doryInteractions,
        images: doryImages
    },
    {
        id: '6M06-7XC1-V1QZ-OAKF',
        name: 'Lenore',
        location: lionStatueHelsinki,
        dialogue: lenoreDialog,
        interactions: lenoreInteractions,
        images: lenoreImages
    },
    {
        id: '20XX-5F0Z-M1BV-MQKE',
        name: 'Alby',
        location: helsinkiWinterGarden,
        dialogue: albyDialog,
        interactions: albyInteractions,
        images: albyImages
    },
    {
        id: 'BKS4-FAGG-ACBU-LZR1',
        name: 'Nissa',
        location: cafeRegatta,
        dialogue: nissaDialog,
        interactions: nissaInteractions,
        images: nissaImages
    },
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

export const PET_DATA_MAP = new Map(PET_DATA.map(pet => [pet.id, pet]));
