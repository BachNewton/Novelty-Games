import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { nullPromise, wait } from "../../../util/Async";
import { Song, SongMetadata, TrackIds } from "../data/MusicPlayerIndex";

const ON_COMPLETE_WAIT_TIME = 1500;

type ResponsePromises = { [Id in keyof TrackIds]: Promise<DownloadFileResponse | null> };

export type Tracks = { [Id in keyof TrackIds]: HTMLAudioElement | null };

export interface ParsedSong {
    metadata: SongMetadata;
    tracksPromise: Promise<Tracks>;
}

export interface ParserProgress {
    current: number;
    total: number;
}

export interface SongParser {
    parse(song: Song, onParserProgress: (progress: ParserProgress | null) => void): ParsedSong;
}

export function createSongParser(networkService: NetworkService<void>): SongParser {
    const createResponsePromise = (id: string | null) => id === null
        ? nullPromise<DownloadFileResponse>()
        : networkService.downloadFile({ id: id });

    return {
        parse: (song, onParserProgress) => parse(song, onParserProgress, createResponsePromise)
    };
}

function parse(
    song: Song,
    onParserProgress: (progress: ParserProgress | null) => void,
    createResponsePromise: (id: string | null) => Promise<DownloadFileResponse | null>
): ParsedSong {
    let current = 0;
    const total = Object.values(song.ids).filter(id => id !== null).length;

    onParserProgress({
        total: total,
        current: current
    });

    const responsePromises: ResponsePromises = {
        guitar: createResponsePromise(song.ids.guitar),
        bass: createResponsePromise(song.ids.bass),
        vocals: createResponsePromise(song.ids.vocals),
        backing: createResponsePromise(song.ids.backing),
        drums: createResponsePromise(song.ids.drums),
        drums1: createResponsePromise(song.ids.drums1),
        drums2: createResponsePromise(song.ids.drums2),
        drums3: createResponsePromise(song.ids.drums3),
        keys: createResponsePromise(song.ids.keys)
    };

    Object.entries(responsePromises).forEach(async ([id, responsePromise]) => {
        console.log(`Downloading track: ${id}`);

        const response = await responsePromise;

        if (response === null) {
            console.warn(`Track ${id} is null, skipping...`);
            return;
        }

        console.log(`Track ${id} downloaded`);

        onParserProgress({
            total: total,
            current: ++current
        });

        if (current === total) {
            console.log('All tracks downloaded');
            await wait(ON_COMPLETE_WAIT_TIME);
            onParserProgress(null);
        }
    });

    const tracksPromise = createTracksPromise(responsePromises);

    return {
        metadata: song.metadata,
        tracksPromise: tracksPromise
    };
}

async function createTracksPromise(responsePromises: ResponsePromises): Promise<Tracks> {
    return {
        guitar: await createTrackPromise(responsePromises.guitar),
        bass: await createTrackPromise(responsePromises.bass),
        vocals: await createTrackPromise(responsePromises.vocals),
        backing: await createTrackPromise(responsePromises.backing),
        drums: await createTrackPromise(responsePromises.drums),
        drums1: await createTrackPromise(responsePromises.drums1),
        drums2: await createTrackPromise(responsePromises.drums2),
        drums3: await createTrackPromise(responsePromises.drums3),
        keys: await createTrackPromise(responsePromises.keys)
    };
};

async function createTrackPromise(responsePromise: Promise<DownloadFileResponse | null>): Promise<HTMLAudioElement | null> {
    const response = await responsePromise;

    if (response === null) return null;

    const blob = new Blob([response.buffer]);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return audio;
}
