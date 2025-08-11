import { FestivalSong } from "../../../trivia/data/Data";
import { createDatabase } from "../../../util/database/v1/DatabaseImpl";

export interface FortniteFestivalDatabase {
    updateOwnedSong: (isOwned: boolean, song: FestivalSong) => void;
    getOwnedSongs: () => Promise<Set<string>>;
}

export function createFortniteFestivalDatabase(): FortniteFestivalDatabase {
    const database = createDatabase('fortniteFestival', ['owned']);

    return {
        updateOwnedSong: async (isOwned, song) => {
            const superKey = getSuperKey(song);

            await database.deleteRow('owned', data => data.superKey === superKey).catch(() => { });

            if (isOwned) {
                await database.add('owned', { superKey: getSuperKey(song) });
            }
        },

        getOwnedSongs: async () => new Set((await database.getAll('owned')).map(data => data.superKey))
    };
}

export function getSuperKey(song: FestivalSong): string {
    return `${song.name} --- ${song.artist} --- ${song.year}`;
}
