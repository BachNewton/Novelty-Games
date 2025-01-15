export interface Component {
    id: string;
    name: string;
}

interface RawMaterial extends Component { }

export interface Invention extends Component {
    primaryComponentId: string;
    secondaryComponentId: string;
    inventorId: string;
    inventedDate: number;
}

export const RAW_MATERIALS: RawMaterial[] = [
    {
        id: '0G2E-6P1J-Q8OC-KTYC',
        name: '🔥 Fire'
    },
    {
        id: '7MIU-4HF2-XLJ9-8RBD',
        name: '💧 Water'
    },
    {
        id: 'W8NQ-YMN1-BWHM-IZ69',
        name: '🪵 Wood'
    },
    {
        id: 'VZXS-GDPA-CQE5-4Q8A',
        name: '🪨 Stone'
    },
    {
        id: 'Z1Q2-3U2S-X731-1GB9',
        name: '⛏️ Metal'
    },
    {
        id: 'PERW-BLIN-ATZK-8VFK',
        name: '⚡ Electricity'
    }
];
