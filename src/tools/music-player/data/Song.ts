export interface Song {
    ids: TrackIds;
    metadata: SongMetadata;
}

export interface SongMetadata {
    title: string;
    artist: string;
    genre: string;
    year: number;
}

export interface TrackIds {
    guitar: string | null;
    bass: string | null;
    vocals: string | null;
    drums: string | null;
    drums1: string | null;
    drums2: string | null;
    drums3: string | null;
    keys: string | null;
    backing: string;
}
