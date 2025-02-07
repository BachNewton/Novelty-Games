export interface Lobby {
    ownerId: string;
    players: LobbyPlayer[];
}

export interface LobbyPlayer {
    name: string;
    id: string;
}
