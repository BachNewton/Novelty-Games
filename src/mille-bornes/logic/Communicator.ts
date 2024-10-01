import { LobbyTeam } from "../ui/Lobby";
import { Game, Team } from "./Data";
import { Card } from "./Card";

export interface Communicator {
    addEventListener(type: string, callback: EventListenerOrEventListenerObject): void;
    startGame(game: Game): void;
    playCard(card: Card, targetTeam: Team | null, isExtentionCalled?: boolean): void;
    updateLobby(lobbyTeams: Array<LobbyTeam>): void;
}
