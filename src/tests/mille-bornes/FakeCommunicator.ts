import { Card } from "../../board-games/mille-bornes/logic/Card";
import { Communicator } from "../../board-games/mille-bornes/logic/Communicator";
import { Game, Team } from "../../board-games/mille-bornes/logic/Data";
import { LobbyTeam } from "../../board-games/mille-bornes/ui/Lobby";

export class FakeCommunicator implements Communicator {
    private onPlayCard: (card: Card, targetTeam: Team | null, isExtentionCalled?: boolean | undefined) => void;

    constructor(onPlayCard: (card: Card, targetTeam: Team | null, isExtentionCalled?: boolean | undefined) => void = () => { }) {
        this.onPlayCard = onPlayCard;
    }

    addEventListener(type: string, callback: EventListenerOrEventListenerObject): void {
        // Intentionally empty for testing puropses.
    }

    startGame(game: Game): void {
        // Intentionally empty for testing puropses.
    }

    playCard(card: Card, targetTeam: Team | null, isExtentionCalled?: boolean | undefined): void {
        this.onPlayCard(card, targetTeam, isExtentionCalled);
    }

    updateLobby(lobbyTeams: LobbyTeam[]): void {
        // Intentionally empty for testing puropses.
    }
}
