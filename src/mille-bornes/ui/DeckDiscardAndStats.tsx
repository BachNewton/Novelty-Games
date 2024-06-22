import { Card } from "../logic/Card";
import { Player } from "../logic/Data";
import DeckDiscard from "./DeckDiscard";

interface DeckDiscardAndStatsProps {
    discard: Card | null;
    greyedOut: boolean;
    currentPlayer: Player;
}

const DeckDiscardAndStats: React.FC<DeckDiscardAndStatsProps> = ({ discard, greyedOut, currentPlayer }) => {
    return <div style={{ display: 'flex', minHeight: 0 }}>
        <DeckDiscard discard={discard} greyedOut={greyedOut} />

        <div style={{ flexGrow: 1, textAlign: 'center' }}>
            It is {currentPlayer.name}'s turn
        </div>
    </div>
};

export default DeckDiscardAndStats;
