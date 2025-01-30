import { PlayerColor } from "../data/Piece";

const MARGIN = '5px';

interface CircleProps {
    color: PlayerColor;
}

const Circle: React.FC<CircleProps> = ({ color }) => {
    return <div style={{ borderRadius: '100%', margin: MARGIN, background: getColor(color) }} />;
};

export function getColor(color: PlayerColor): string {
    switch (color) {
        case PlayerColor.RED:
            return 'red';
        case PlayerColor.BLUE:
            return 'blue';
        case PlayerColor.YELLOW:
            return 'yellow';
        case PlayerColor.GREEN:
            return 'green';
    }
}

export default Circle;
