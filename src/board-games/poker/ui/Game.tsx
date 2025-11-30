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
    }}>
        <Board pot={pot} cards={boardCards} data={data} />

        <VerticalSpacer height={10} />

        <div style={{
            flexGrow: 1,
            overflow: 'auto',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
            boxShadow: '0px 0px 5px black',
            overscrollBehaviorY: 'contain'
        }}>
            {messgaesUi}
        </div>

        <VerticalSpacer height={10} />

        <PlayerInterface data={data} actions={actions} boardCards={boardCards} />
    </div>;
};

export default Game;
