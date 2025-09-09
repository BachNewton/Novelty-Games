import { useEffect, useState } from "react";
import Canvas from "../../../util/ui/Canvas";
import { MonopolyActions } from "../data/MonopolyActions";
import { MonopolyState } from "../data/MonopolyState";
import { drawBoard } from "../canvas/board";

const PADDING = 2;

interface MonopolyCanvasProps {
    state: MonopolyState;
    actions: MonopolyActions;
    id: string;
}

const MonopolyCanvas: React.FC<MonopolyCanvasProps> = ({ state, actions, id }) => {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <Canvas
        width={width}
        height={height}
        draw={(ctx) => {
            drawBoard(
                ctx,
                { x: PADDING, y: PADDING, width: width - (PADDING * 2), height: height - (PADDING * 2) },
                state
            );
        }}
    />;
};

export default MonopolyCanvas;
