import { Square as SquareData } from "../data/Square";

interface SquareProps {
    data: SquareData;
}

const Square: React.FC<SquareProps> = ({ data }) => {
    return <div style={{
        backgroundColor: data.type === 'property' ? data.color : undefined
    }}>
        {data.name}
    </div>;
};

export default Square;
