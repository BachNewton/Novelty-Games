import { FestivalSong } from "../../../trivia/data/Data";

const UNKNOWN_LABEL = 'Unknown';

/**
 * Songs cached before the store release date was scraped won't have one, so sort them
 * to the oldest end rather than letting NaN scramble the comparison.
 */
export function getStoreReleaseTime(song: FestivalSong): number {
    if (song.storeReleaseDate === null || song.storeReleaseDate === undefined) return -Infinity;

    const time = new Date(song.storeReleaseDate).getTime();

    return isNaN(time) ? -Infinity : time;
}

export function formatStoreReleaseDate(song: FestivalSong): string {
    const time = getStoreReleaseTime(song);

    if (time === -Infinity) return UNKNOWN_LABEL;

    return new Date(time).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
