export interface Component {
    id: string;
    name: string;
}

interface RawMaterial extends Component { }

export const RAW_MATERIALS: RawMaterial[] = [
    {
        id: 'id1',
        name: '🔥 Fire'
    },
    {
        id: 'id2',
        name: '💧 Water'
    },
    {
        id: 'id3',
        name: '🪵 Wood'
    },
    {
        id: 'id4',
        name: '🪨 Stone'
    },
    {
        id: 'id5',
        name: '⛏️ Metal'
    },
    {
        id: 'id6',
        name: '⚡ Electricity'
    }
];
