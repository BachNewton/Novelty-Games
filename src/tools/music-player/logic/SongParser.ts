import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { nullPromise, wait } from "../../../util/Async";
import { Song, SongMetadata, TrackIds } from "../data/MusicPlayerIndex";
import { Conductor, createConductor } from "./Conductor";
import { createParserProgressTracker, ParserProgressTracker } from "./ParserProgressTracker";

type ResponsePromises = { [Id in keyof TrackIds]: Promise<DownloadFileResponse | null> };

type AudioBufferPromises = { [Id in keyof TrackIds]: Promise<AudioBuffer | null> };

export type AudioBuffers = { [Id in keyof TrackIds]: AudioBuffer | null };

export interface ParsedSong {
    metadata: SongMetadata;
    conductorPromise: Promise<Conductor>;
}

export interface ParserProgress {
    current: number;
    total: number;
}

export interface SongParser {
    parse(song: Song, onParserProgress: (progress: ParserProgress | null) => void): ParsedSong;
}

export function createSongParser(networkService: NetworkService<void>): SongParser {
    const audioContext = new AudioContext();

    const createResponsePromise = (id: string | null) => id === null
        ? nullPromise<DownloadFileResponse>()
        : networkService.downloadFile({ id: id });

    return {
        parse: (song, onParserProgress) => parse(song, onParserProgress, createResponsePromise, audioContext)
    }
};

function parse(
    song: Song,
    onParserProgress: (progress: ParserProgress | null) => void,
    createResponsePromise: (id: string | null) => Promise<DownloadFileResponse | null>,
    audioContext: AudioContext
): ParsedSong {
    const nonNullIds = Object.values(song.ids).filter(id => id !== null).length;
    const total = nonNullIds * 2; // Each track has a download and decode step
    const parserProgressTracker = createParserProgressTracker(total, onParserProgress);

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

        parserProgressTracker.makeProgress();
    });

    return {
        metadata: song.metadata,
        conductorPromise: createConductorPromise(audioContext, responsePromises, parserProgressTracker)
    };
}

async function decodeAudioBuffer(audioContext: AudioContext, responsePromise: Promise<DownloadFileResponse | null>): Promise<AudioBuffer | null> {
    const response = await responsePromise;

    if (response !== null && response.buffer instanceof ArrayBuffer) {
        return audioContext.decodeAudioData(response.buffer);
    } else {
        return nullPromise();
    }
}

async function createConductorPromise(
    audioContext: AudioContext,
    responsePromises: ResponsePromises,
    parserProgressTracker: ParserProgressTracker
): Promise<Conductor> {
    const audioBuffersPromises: AudioBufferPromises = {
        guitar: decodeAudioBuffer(audioContext, responsePromises.guitar),
        bass: decodeAudioBuffer(audioContext, responsePromises.bass),
        vocals: decodeAudioBuffer(audioContext, responsePromises.vocals),
        backing: decodeAudioBuffer(audioContext, responsePromises.backing),
        drums: decodeAudioBuffer(audioContext, responsePromises.drums),
        drums1: decodeAudioBuffer(audioContext, responsePromises.drums1),
        drums2: decodeAudioBuffer(audioContext, responsePromises.drums2),
        drums3: decodeAudioBuffer(audioContext, responsePromises.drums3),
        keys: decodeAudioBuffer(audioContext, responsePromises.keys)
    };

    Object.entries(audioBuffersPromises).forEach(async ([id, audioBuffersPromise]) => {
        console.log(`Decoding audio buffer for: ${id}`);

        const audioBuffer = await audioBuffersPromise;

        if (audioBuffer === null) {
            console.warn(`Audio buffer ${id} is null, skipping...`);
            return;
        }

        console.log(`Audio buffer ${id} decoded`);

        parserProgressTracker.makeProgress();
    });

    const audioBuffers: AudioBuffers = {
        guitar: await audioBuffersPromises.guitar,
        bass: await audioBuffersPromises.bass,
        vocals: await audioBuffersPromises.vocals,
        backing: await audioBuffersPromises.backing,
        drums: await audioBuffersPromises.drums,
        drums1: await audioBuffersPromises.drums1,
        drums2: await audioBuffersPromises.drums2,
        drums3: await audioBuffersPromises.drums3,
        keys: await audioBuffersPromises.keys
    };

    parserProgressTracker.complete();

    return createConductor(audioContext, audioBuffers);
}
