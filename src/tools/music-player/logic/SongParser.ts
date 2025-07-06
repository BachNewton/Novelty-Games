import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { Song, TrackIds } from "../data/MusicPlayerIndex";

type TrackPromises = { [Id in keyof TrackIds]: Promise<HTMLAudioElement | null> };

export interface SongParser {
    parse(song: Song): TrackPromises;
}

export function createSongParser(networkService: NetworkService<void>): SongParser {
    const createResponse = (id: string | null) => id === null ? null : networkService.downloadFile({ id: id });

    return {
        parse: (song) => {
            return {
                guitar: createTrack('guitar', createResponse(song.ids.guitar)),
                bass: createTrack('bass', createResponse(song.ids.bass)),
                vocals: createTrack('vocals', createResponse(song.ids.vocals))
            };
        }
    };
}

async function createTrack(track: keyof TrackIds, responsePromise: Promise<DownloadFileResponse> | null): Promise<HTMLAudioElement | null> {
    if (responsePromise === null) {
        console.log('No ID found for:', track);
        return null;
    }

    console.log('Downloading:', track);
    const response = await responsePromise;
    console.log('Downloaded:', track);

    const blob = new Blob([response.buffer]);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return audio;
}
