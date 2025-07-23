export interface Component {
    id: string;
    name: string;
}

export interface ComponentQuantity {
    componentId: string;
    quantity: number;
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
        id: 'N4QN-NZ85-RWWX-XPLN',
        name: '🪱 Dirt'
    },
    {
        id: 'VZXS-GDPA-CQE5-4Q8A',
        name: '🪨 Stone'
    },
    {
        id: 'Z1Q2-3U2S-X731-1GB9',
        name: '⛓️ Iron'
    },
    {
        id: 'PERW-BLIN-ATZK-8VFK',
        name: '⚡ Power'
    },
    {
        id: '3XLB-MHJD-4Y2S-Y42B',
        name: '🧵 Fabric'
    },
    {
        id: 'R16B-27MZ-89A9-6FRW',
        name: '🛢️ Oil'
    },
    {
        id: '15Y9-WMJE-5JLN-CCDO',
        name: '🛍️ Plastic'
    }
];

export const RAW_MATERIALS_MAPPED = new Map(RAW_MATERIALS.map(material => [material.id, material]));
