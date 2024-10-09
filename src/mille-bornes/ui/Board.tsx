import { useEffect, useState } from "react";
import { Card, HazardCard, LimitCard } from "../logic/Card";
import { Game, Player, PlayerType, Team } from "../logic/Data";
import { canCardBePlayed, getCurrentPlayerTeam, getRemainingDistance, isGameAtMaxTargetDistance, playCard } from "../logic/Rules";
import Hand from './Hand';
import TableauUi from "./Tableau";
import { Communicator } from "../logic/Communicator";
import DeckDiscardAndStats from "./DeckDiscardAndStats";
import { shouldComputerPlayerTakeItsTurn, takeComputerPlayerTurn } from "../logic/ComputerPlayer";
import { PlayCardEvent } from "../logic/NewtorkCommunicator";
import Dialog from "./Dialog";

interface BoardProps {
    startingGame: Game;
    communicator: Communicator;
    localId: string;
    onRoundOver: (game: Game) => void;
}

interface State {
    game: Game;
    ui: UiState;
}

interface UiState {
    card: Card | null;
}

class DialogUiState implements UiState {
    card: Card;
    targetTeam: Team;

    constructor(card: Card, targetTeam: Team) {
        this.card = card;
        this.targetTeam = targetTeam;
    }
}

class CardSelection implements UiState {
    card: Card | null;

    constructor() {
        this.card = null;
    }
}

class TargetSelection implements UiState {
    card: Card;

    constructor(card: Card) {
        this.card = card;
    }
}

class TeamSelection extends TargetSelection {
    team: Team;

    constructor(card: Card, team: Team) {
        super(card);
        this.team = team;
    }
}

class DiscardSelection extends TargetSelection { }

let canComputerPlayerMove = true;
const COMPUTER_THINK_TIME = 1500;

const Board: React.FC<BoardProps> = ({ startingGame, communicator, localId, onRoundOver }) => {
    const [state, setState] = useState<State>({ game: startingGame, ui: new CardSelection() });

    useEffect(() => {
        communicator.addEventListener(PlayCardEvent.TYPE, (event) => {
            const playCardEvent = event as PlayCardEvent;
            const targetTeam = getTeamById(playCardEvent.targetTeamId, state.game);
            playCard(playCardEvent.card, state.game, targetTeam, onRoundOver);

            // We can't "uncall" an extention, so only update the extention state if it was called
            if (playCardEvent.isExtentionCalled) {
                state.game.extention = playCardEvent.isExtentionCalled;
            }

            const isRoundOver = state.game.teams.some(team => getRemainingDistance(team.tableau.distanceArea, state.game.teams, state.game.extention) === 0);
            if (isRoundOver) {
                onRoundOver(state.game);
            }

            setState({ ...state });
        });
    }, [state]);

    const checkIfTargetDistanceReached = (targetTeam: Team) => {
        const teamAtTargetDistance = getRemainingDistance(targetTeam.tableau.distanceArea, state.game.teams, state.game.extention) === 0;

        if (teamAtTargetDistance) {
            if (state.game.extention || isGameAtMaxTargetDistance(state.game.teams)) {
                onRoundOver(state.game);
            } else {
                state.ui = new DialogUiState(state.ui.card!, targetTeam);
                setState({ ...state });
            }
        }
    };

    if (shouldComputerPlayerTakeItsTurn(state.game, localId, canComputerPlayerMove)) {
        canComputerPlayerMove = false;
        console.log(`Computer is fake "thinking" for ${COMPUTER_THINK_TIME} ms.`);

        setTimeout(() => {
            console.log('Computer is taking its turn now.');
            takeComputerPlayerTurn(state.game, onRoundOver, communicator, checkIfTargetDistanceReached);
            canComputerPlayerMove = true;
            setState({ ...state });
        }, COMPUTER_THINK_TIME);
    }

    const itIsYourTurn = state.game.currentPlayer.localId === localId && state.game.currentPlayer.type !== PlayerType.COMPUTER;

    const onPlayCard = (card: Card) => {
        if (!(state.ui instanceof CardSelection) || !itIsYourTurn) return;

        if (state.ui.card !== card) {
            state.ui.card = card;
        } else {
            if (card instanceof HazardCard || card instanceof LimitCard) {
                if (canCardBePlayed(card, state.game)) {
                    state.ui = new TargetSelection(card);
                } else {
                    playCard(card, state.game, null, onRoundOver);
                    communicator.playCard(card, null);
                    state.ui.card = null;
                }
            } else {
                const targetTeam = getCurrentPlayerTeam(state.game);
                playCard(card, state.game, targetTeam, onRoundOver);
                checkIfTargetDistanceReached(targetTeam);

                const userHasBeenPromptedForExtention = state.ui instanceof DialogUiState;
                if (!userHasBeenPromptedForExtention) {
                    communicator.playCard(card, targetTeam, false);
                    state.ui.card = null;
                }
            }
        }

        setState({ ...state });
    };

    const localPlayerTeam = getLocalPlayerTeam(state.game, localId);
    const otherTeams = getOtherTeams(state.game, localPlayerTeam);

    const otherTeamsTableau = otherTeams.map((otherTeam, index) => {
        const onClick = () => {
            if (state.ui instanceof TargetSelection) {
                if (state.ui instanceof TeamSelection && state.ui.team === otherTeam) {
                    playCard(state.ui.card, state.game, otherTeam, onRoundOver);
                    communicator.playCard(state.ui.card, otherTeam);
                    state.ui = new CardSelection();
                } else {
                    state.ui = new TeamSelection(state.ui.card, otherTeam)
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

    const greyedOut = state.ui instanceof TargetSelection;

    const localTeamsTableau = localPlayerTeam === null
        ? <></>
        : <TableauUi
            team={localPlayerTeam}
            greyedOut={greyedOut}
            remainingDistance={getRemainingDistance(localPlayerTeam.tableau.distanceArea, state.game.teams, state.game.extention)}
        />;

    const isCardPlayable = (card: Card) => canCardBePlayed(card, state.game);

    const onDiscardClicked = () => {
        if (state.ui instanceof TargetSelection) {
            if (state.ui instanceof DiscardSelection) {
                playCard(state.ui.card, state.game, null, onRoundOver);
                communicator.playCard(state.ui.card, null);
                state.ui = new CardSelection();
            } else {
                state.ui = new DiscardSelection(state.ui.card);
            }

            setState({ ...state });
        }
    };

    const onDialogSelection = (selection: string) => {
        if (selection === 'Yes') {
            state.game.extention = true;
        } else {
            onRoundOver(state.game);
        }

        const uiState = state.ui as DialogUiState;
        communicator.playCard(uiState.card, uiState.targetTeam, state.game.extention);
        state.ui = new CardSelection();

        setState({ ...state });
    };

    const gridTemplateRows = '1fr ' + state.game.teams.map(_ => '3fr').join(' ') + ' 1fr';
    return <>
        <div style={{ display: 'grid', height: '100vh', gridTemplateRows: gridTemplateRows, overflow: 'hidden', color: 'white' }}>
            <DeckDiscardAndStats
                discard={state.game.discard}
                greyedOut={greyedOut}
                currentPlayer={state.game.currentPlayer}
                remainingCardsInDeck={state.game.deck.length}
                extentionCalled={state.game.extention}
                onDiscardClicked={onDiscardClicked}
                isDiscardHighlighted={state.ui instanceof DiscardSelection}
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
        </div>

        <Dialog
            isOpen={state.ui instanceof DialogUiState}
            title={['Your team has reached the target!', 'Would like to to call an extention?']}
            options={['No', 'Yes']}
            onSelection={onDialogSelection}
        />
    </>;
};

function getLocalPlayer(game: Game, localId: string): Player | null {
    if (game.currentPlayer.localId === localId && game.currentPlayer.type !== PlayerType.COMPUTER) {
        return game.currentPlayer;
    }

    for (const team of game.teams) {
        for (const player of team.players) {
            if (player.localId === localId && player.type !== PlayerType.COMPUTER) {
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

function getOtherTeams(game: Game, localPlayerTeam: Team | null): Array<Team> {
    return game.teams.filter(team => team !== localPlayerTeam);
}

function getTeamById(teamId: string | null, game: Game): Team | null {
    return game.teams.find(team => team.id === teamId) || null;
}

export default Board;
