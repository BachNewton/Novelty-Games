import { useEffect, useState } from "react";
import { Card, LimitCard } from "../logic/Card";
import { Game, Player, Team } from "../logic/Data";
import { canCardBePlayed, getCurrentPlayerTeam, getRemainingDistance, isGameAtMaxTargetDistance, isInstanceOfHazardCard, playCard } from "../logic/Rules";
import Hand from './Hand';
import TableauUi from "./Tableau";
import { Communicator, PlayCardEvent } from "../logic/Communicator";
import DeckDiscardAndStats from "./DeckDiscardAndStats";

interface BoardProps {
    startingGame: Game;
    communicator: Communicator;
    localId: string;
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

const Board: React.FC<BoardProps> = ({ startingGame, communicator, localId }) => {
    const [state, setState] = useState<State>({ game: startingGame, ui: new CardSelection() });

    useEffect(() => {
        communicator.addEventListener(PlayCardEvent.TYPE, (event) => {
            const playCardEvent = event as PlayCardEvent;
            const targetTeam = getTeamById(playCardEvent.targetTeamId, state.game);
            playCard(playCardEvent.card, state.game, targetTeam);
            state.game.extention = playCardEvent.isExtentionCalled;

            const isGameOver = state.game.teams.some(team => getRemainingDistance(team.tableau.distanceArea, state.game.teams, state.game.extention) === 0);
            if (isGameOver) {
                throw new Error("The game is over");
            }

            setState({ ...state });
        });
    }, [state]);

    const itIsYourTurn = getLocalPlayer(state.game, localId)?.localId === state.game.currentPlayer.localId;

    const onPlayCard = (card: Card) => {
        if (!(state.ui instanceof CardSelection) || !itIsYourTurn) return;

        if (state.ui.card !== card) {
            state.ui.card = card;
        } else {
            if (isInstanceOfHazardCard(card) || card instanceof LimitCard) {
                if (canCardBePlayed(card, state.game)) {
                    state.ui = new TeamSelection(card);
                } else {
                    playCard(card, state.game, null);
                    communicator.playCard(card, null);
                    state.ui.card = null;
                }
            } else {
                const targetTeam = getCurrentPlayerTeam(state.game);
                playCard(card, state.game, targetTeam);

                const teamAtTargetDistance = getRemainingDistance(targetTeam.tableau.distanceArea, state.game.teams, state.game.extention) === 0;
                if (teamAtTargetDistance) {
                    if (state.game.extention || isGameAtMaxTargetDistance(state.game.teams)) {
                        throw new Error("The game is over");
                    } else {
                        const calledExtention = window.confirm('Your team has reached the target! Would like to to call an extention?');

                        if (calledExtention) {
                            state.game.extention = true;
                        } else {
                            throw new Error("The game is over");
                        }
                    }
                }

                communicator.playCard(card, targetTeam, state.game.extention);
                state.ui.card = null;
            }
        }

        setState({ ...state });
    };

    const localPlayerTeam = getLocalPlayerTeam(state.game, localId);

    const otherTeamsTableau = state.game.teams.filter(team => team !== localPlayerTeam).map((otherTeam, index) => {
        const onClick = () => {
            if (state.ui instanceof TeamSelection) {
                if (state.ui.team === otherTeam) {
                    playCard(state.ui.card, state.game, otherTeam);
                    communicator.playCard(state.ui.card, otherTeam);
                    state.ui = new CardSelection();
                } else {
                    state.ui.team = otherTeam;
                }

                setState({ ...state });
            }
        };

        return <TableauUi
            onClick={onClick}
            team={otherTeam}
            key={index}
            isHighlighted={state.ui instanceof TeamSelection && state.ui.team === otherTeam}
            remainingDistance={getRemainingDistance(otherTeam.tableau.distanceArea, state.game.teams, state.game.extention)}
        />;
    });

    const greyedOut = state.ui instanceof TeamSelection;

    const localTeamsTableau = localPlayerTeam === null
        ? <></>
        : <TableauUi
            team={localPlayerTeam}
            greyedOut={greyedOut}
            remainingDistance={getRemainingDistance(localPlayerTeam.tableau.distanceArea, state.game.teams, state.game.extention)}
        />;

    const isCardPlayable = (card: Card) => canCardBePlayed(card, state.game);

    const gridTemplateRows = '1fr ' + state.game.teams.map(_ => '3fr').join(' ') + ' 1fr';
    return <div style={{ display: 'grid', height: '100vh', gridTemplateRows: gridTemplateRows, overflow: 'hidden', color: 'white' }}>
        <DeckDiscardAndStats
            discard={state.game.discard}
            greyedOut={greyedOut}
            currentPlayer={state.game.currentPlayer}
            remainingCardsInDeck={state.game.deck.length}
            extentionCalled={state.game.extention}
        />

        {otherTeamsTableau}
        {localTeamsTableau}

        <Hand
            hand={getLocalHandCards(state.game, localId)}
            onPlayCard={onPlayCard}
            highlightedCard={state.ui.card}
            greyedOut={greyedOut || !itIsYourTurn}
            isCardPlayable={isCardPlayable}
        />
    </div>;
};

function getLocalPlayer(game: Game, localId: string): Player | null {
    if (game.currentPlayer.localId === localId) {
        return game.currentPlayer;
    }

    for (const team of game.teams) {
        for (const player of team.players) {
            if (player.localId === localId) {
                return player;
            }
        }
    }

    return null;
}

function getLocalHandCards(game: Game, localId: string): Array<Card> {
    return getLocalPlayer(game, localId)?.hand || [];
}

function getLocalPlayerTeam(game: Game, localId: string): Team | null {
    const localPlayerTeamId = getLocalPlayer(game, localId)?.teamId || null;

    return game.teams.find(team => team.id === localPlayerTeamId) || null;
}

function getTeamById(teamId: string | null, game: Game): Team | null {
    return game.teams.find(team => team.id === teamId) || null;
}

export default Board;
