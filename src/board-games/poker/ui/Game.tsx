import { Card as CardData } from "../data/Card";
import { GameData } from "../data/GameData";
import Board from "./Board";
import VerticalSpacer from "../../../util/ui/Spacer";
import PlayerInterface, { Actions } from "./PlayerInterface";

interface GameProps {
    data: GameData;
    isYourTurn: boolean;
    actions: Actions;
    pot: number;
    boardCards: CardData[];
    messages: string[];
}

const Game: React.FC<GameProps> = ({ data, isYourTurn, actions, pot, boardCards, messages }) => {
    const messgaesUi = messages.map((message, index) => <div key={index} style={{ marginBottom: '7px' }}>{message}</div>);

    return <div style={{
        userSelect: 'none',
        padding: '10px',
        height: '100dvh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    }} onScroll={e => e.preventDefault()}>
        <Board pot={pot} cards={boardCards} data={data} />

        <VerticalSpacer height={10} />

        <div
            // onTouchMove={preventPullToRefresh}
            style={{
                flexGrow: 1,
                overflow: 'auto',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '5px',
                boxShadow: '0px 0px 5px black',
                // overscrollBehaviorY: 'contain'
            }}
        >
            {messgaesUi}
        </div>

        <VerticalSpacer height={10} />

        <PlayerInterface data={data} actions={actions} />
    </div>;
};

function preventPullToRefresh(event: React.TouchEvent<HTMLDivElement>): void {
    const element = event.currentTarget;

    // If element can't scroll, or is at top and trying to scroll down, prevent pull-to-refresh
    if (element.scrollHeight <= element.clientHeight || element.scrollTop === 0) {
        event.preventDefault();
    }
}

export default Game;
