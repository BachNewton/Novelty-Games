import { FestivalSong } from "../../../trivia/data/Data";

export interface RankedSong extends FestivalSong {
    rank: number;
    overallDifficulty: number;
}
