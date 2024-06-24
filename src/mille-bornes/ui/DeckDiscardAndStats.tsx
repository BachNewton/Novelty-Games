import { Card } from "../logic/Card";
import { Player } from "../logic/Data";
import DeckDiscard from "./DeckDiscard";

interface DeckDiscardAndStatsProps {
    discard: Card | null;
    greyedOut: boolean;
    currentPlayer: Player;
    remainingCardsInDeck: number;
}

const DeckDiscardAndStats: React.FC<DeckDiscardAndStatsProps> = ({ discard, greyedOut, currentPlayer, remainingCardsInDeck }) => {
    return <div style={{ display: 'flex', minHeight: 0 }}>
        <DeckDiscard discard={discard} greyedOut={greyedOut} remainingCardsInDeck={remainingCardsInDeck} />

        <div style={{ flexGrow: 1, textAlign: 'center', fontSize: '1.5em' }}>
            It's <strong>{currentPlayer.name}</strong>'s turn
        </div>
    </div>
};

export default DeckDiscardAndStats;
