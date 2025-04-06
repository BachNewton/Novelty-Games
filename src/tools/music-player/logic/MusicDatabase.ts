import { createDatabase, Database, DatabaseNames } from "../../../util/Database";

export interface SongPackage {
    folderName: string;
    ini: File,
    guitar: File,
    bass: File,
    vocals: File,
    drums: File | null,
    drums1: File | null,
    drums2: File | null,
    drums3: File | null,
    keys: File | null,
    backing: File,
}

export type MusicDatabaseTables = { 'songs': SongPackage };

export function createMusicDatabase(): Database<DatabaseNames.MUSIC> {
    return createDatabase(DatabaseNames.MUSIC, { 'songs': {} as SongPackage });
}
