import { Player } from "./Player";

export interface GameData {
    players: Player[];
    player: Player;
    toCall: number;
}
