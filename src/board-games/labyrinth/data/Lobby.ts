export interface Lobby {
    ownerId: string;
    players: LobbyPlayer[];
}

interface LobbyPlayer {
    name: string;
    id: string;
}
