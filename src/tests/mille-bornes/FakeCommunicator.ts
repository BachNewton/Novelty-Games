import { Card } from "../../mille-bornes/logic/Card";
import { Communicator } from "../../mille-bornes/logic/Communicator";
import { Game, Team } from "../../mille-bornes/logic/Data";
import { LobbyTeam } from "../../mille-bornes/ui/Lobby";

export class FakeCommunicator implements Communicator {

    addEventListener(type: string, callback: EventListenerOrEventListenerObject): void {
        // Intentionally empty for testing puropses.
    }

    startGame(game: Game): void {
        // Intentionally empty for testing puropses.
    }

    playCard(card: Card, targetTeam: Team | null, isExtentionCalled?: boolean | undefined): void {
        // Intentionally empty for testing puropses.
    }

    updateLobby(lobbyTeams: LobbyTeam[]): void {
        // Intentionally empty for testing puropses.
    }
}
