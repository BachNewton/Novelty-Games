import { Square as SquareData } from "../data/Square";

interface SquareProps {
    data: SquareData;
}

const Square: React.FC<SquareProps> = ({ data }) => {
    return <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: data.type === 'street' ? data.color : undefined
    }}>
        {data.name}
    </div>;
};

export default Square;
