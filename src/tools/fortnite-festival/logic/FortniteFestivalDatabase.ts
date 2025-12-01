import { FestivalSong } from "../../../trivia/data/Data";
import { Database } from "../../../util/database/Database";
import { createDatabase } from "../../../util/database/DatabaseImpl";
import { FortniteFestivalTables } from "../../../util/database/DatabaseSchemas";
import { createFile, FileType, loadFile } from "../../../util/File";

export interface FortniteFestivalDatabase {
    updateOwnedSong: (isOwned: boolean, song: FestivalSong) => void;
    getOwnedSongs: () => Promise<Set<string>>;
    exportOwnedSongs: () => void;
    importOwnedSongs: () => Promise<Set<string>>;
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

        getOwnedSongs: async () => new Set(await getOwnedSongs(database)),

        exportOwnedSongs: async () => {
            const ownedSongs = await getOwnedSongs(database);

            const json = JSON.stringify(ownedSongs);

            createFile(FileType.JSON, 'Owned Fortnite Festival Songs', json);
        },

        importOwnedSongs: async () => {
            const ownedSongs = await loadFile<string[]>(FileType.JSON);

            (async () => {
                await database.deleteTable('owned');

                await database.addAll('owned', ownedSongs.map(superKey => {
                    return { superKey: superKey };
                }));
            })();

            return new Set(ownedSongs);
        }
    };
}

export function getSuperKey(song: FestivalSong): string {
    return `${song.name} --- ${song.artist} --- ${song.year}`;
}

async function getOwnedSongs(database: Database<FortniteFestivalTables>): Promise<string[]> {
    return (await database.getAll('owned')).map(data => data.superKey)
}
