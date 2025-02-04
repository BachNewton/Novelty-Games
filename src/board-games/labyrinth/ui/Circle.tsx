import { getColor, PlayerColor } from "../data/Player";

const MARGIN = '5px';

interface CircleProps {
    color: PlayerColor;
}

const Circle: React.FC<CircleProps> = ({ color }) => {
    return <div style={{ borderRadius: '100%', margin: MARGIN, background: getColor(color) }} />;
};

export default Circle;
