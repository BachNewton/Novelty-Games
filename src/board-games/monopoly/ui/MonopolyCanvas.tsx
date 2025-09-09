import { useEffect, useRef, useState } from "react";
import Canvas from "../../../util/ui/Canvas";
import { MonopolyActions } from "../data/MonopolyActions";
import { MonopolyState } from "../data/MonopolyState";
import { drawBoard } from "../canvas/board";
import { createMonopolyIcons } from "../data/MonopolyIcons";

const ACTION_DELAY_MS = 2000;
const PADDING = 2;

interface MonopolyCanvasProps {
    state: MonopolyState;
    actions: MonopolyActions;
    id: string;
}

const MonopolyCanvas: React.FC<MonopolyCanvasProps> = ({ state, actions, id }) => {
    const icons = useRef(createMonopolyIcons()).current;
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

    useEffect(() => {
        const currentPlayer = state.players[state.currentPlayerIndex];
        let timeoutId: NodeJS.Timeout | undefined;

        if (id === currentPlayer.id) {
            timeoutId = setTimeout(() => {
                actions.roll();
            }, ACTION_DELAY_MS);
        }

        return () => clearTimeout(timeoutId);
    }, [state]);

    return <Canvas
        width={width}
        height={height}
        draw={(ctx) => {
            drawBoard(
                ctx,
                { x: PADDING, y: PADDING, width: width - (PADDING * 2), height: height - (PADDING * 2) },
                state,
                icons
            );
        }}
    />;
};

export default MonopolyCanvas;
