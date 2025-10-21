import { useEffect, useRef, useState } from "react";
import Canvas from "../../../util/ui/Canvas";
import { MonopolyActions } from "../data/MonopolyActions";
import { MonopolyState } from "../data/MonopolyState";
import { drawBoard } from "../canvas/board";
import { createMonopolyIcons, MonopolyIcons } from "../data/MonopolyIcons";
import { isPointInRect, Rect } from "../canvas/Rect";
import { drawCenter } from "../canvas/center";
import { ClickableRects } from "../canvas/DrawParams";

const ACTION_DELAY_MS = 1500;
const PADDING = 2;

interface MonopolyCanvasProps {
    state: MonopolyState;
    actions: MonopolyActions;
    id: string;
}

const MonopolyCanvas: React.FC<MonopolyCanvasProps> = ({ state, actions, id }) => {
    const icons = useRef(createMonopolyIcons()).current;
    const clickableRects = useRef<ClickableRects>({}).current;
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

        const handleClick = (e: MouseEvent) => {
            const click = { x: e.clientX, y: e.clientY };

            if (isPointInRect(click, clickableRects.no)) {
                console.log('Click in no');
            } else if (isPointInRect(click, clickableRects.yes)) {
                console.log('click in yes');
                actions.buyProperty();
            } else {
                console.log('click on nothing');
            }
        }

        window.addEventListener('click', handleClick);

        if (id === currentPlayer.id && state.phase.type === 'ready') {
            timeoutId = setTimeout(() => {
                actions.roll();
            }, ACTION_DELAY_MS);
        }

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('click', handleClick);
        }
    }, [state]);

    return <Canvas
        width={width}
        height={height}
        draw={ctx => draw(ctx, width, height, state, icons, clickableRects)}
    />;
};

function draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: MonopolyState,
    icons: MonopolyIcons,
    clickableRects: ClickableRects
) {
    const view: Rect = {
        x: PADDING,
        y: PADDING,
        width: width - (PADDING * 2),
        height: height - (PADDING * 2)
    };

    const { centerView } = drawBoard(
        ctx,
        view,
        state,
        icons
    );

    drawCenter({
        ctx,
        view: centerView,
        state,
        icons,
        clickableRects
    });
}

export default MonopolyCanvas;
