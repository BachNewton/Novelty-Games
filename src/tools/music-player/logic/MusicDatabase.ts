import { createDatabase, Database } from "../../../util/Database";

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

export function createMusicDatabase(): Database<MusicDatabaseTables> {
    return createDatabase<MusicDatabaseTables>('music', ['songs']);
}
