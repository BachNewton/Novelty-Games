import { useEffect, useState } from "react";
import { Card, LimitCard } from "../logic/Card";
import { Game, Team } from "../logic/Data";
import { canCardBePlayed, isInstanceOfHazardCard, playCard } from "../logic/Rules";
import Hand from './Hand';
import TableauUi from "./Tableau";
import DeckAndDiscard from './DeckAndDiscard';
import { Communicator } from "../logic/Communicator";

interface BoardProps {
    game: Game;
    communicator: Communicator;
}

interface State {
    game: Game;
    ui: UiState;
}

interface UiState {
    card: Card | null;
}

class CardSelection implements UiState {
    card: Card | null;

    constructor() {
        this.card = null;
    }
}

class TeamSelection implements UiState {
    team: Team | null;
    card: Card;

    constructor(card: Card) {
        this.team = null;
        this.card = card;
    }
}

const Board: React.FC<BoardProps> = ({ game, communicator }) => {
    const [state, setState] = useState<State>({ game: game, ui: new CardSelection() });

    // useEffect(() => {
    //     communicator.addEventListener(GameEvent.TYPE, (e) => {
    //         const event = e as GameEvent;

    //         state.game = event.game;
    //         setState({ ...state });
    //     });
    // }, [communicator]);

    const onPlayCard = (card: Card) => {
        if (state.ui instanceof CardSelection) {
            if (state.ui.card !== card) {
                state.ui.card = card;
            } else {
                if ((isInstanceOfHazardCard(card) || card instanceof LimitCard) && canCardBePlayed(card, game)) {
                    state.ui = new TeamSelection(card);
                } else {
                    playCard(card, game, game.currentPlayer.team, communicator);
                    state.ui.card = null;
                }
            }

            setState({ ...state });
        }
    };

    const otherTeamsTableau = game.teams.filter(team => team !== game.currentPlayer.team).map((otherTeam, index) => {
        const onClick = () => {
            if (state.ui instanceof TeamSelection) {
                if (state.ui.team === otherTeam) {
                    playCard(state.ui.card, game, otherTeam, communicator);
                    state.ui = new CardSelection();
                } else {
                    state.ui.team = otherTeam;
                }

                setState({ ...state });
            }
        };

        return <TableauUi onClick={onClick} team={otherTeam} key={index} isHighlighted={state.ui instanceof TeamSelection && state.ui.team === otherTeam} />
    });

    const gridTemplateRows = '1fr ' + game.teams.map(_ => '3fr').join(' ') + ' 1fr';
    const greyedOut = state.ui instanceof TeamSelection;
    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: gridTemplateRows, overflow: 'hidden', color: 'white' }}>
        <DeckAndDiscard discard={game.discard} greyedOut={greyedOut} />

        {otherTeamsTableau}
        <TableauUi team={game.currentPlayer.team} greyedOut={greyedOut} />

        <Hand hand={game.currentPlayer.hand} onPlayCard={onPlayCard} highlightedCard={state.ui.card} greyedOut={greyedOut} />
    </div>;
};

export default Board;
