import { DownloadFileResponse, NetworkService } from "../../../util/networking/NetworkService";
import { Song, SongIds } from "../data/MusicPlayerIndex";

export interface SongParser {
    parse(song: Song): void;
}

type Responses = { [Id in keyof SongIds]: Promise<DownloadFileResponse> | null };

export function createSongParser(networkService: NetworkService<void>): SongParser {
    const createResponse = (id: string | null) => id === null ? null : networkService.downloadFile({ id: id });

    return {
        parse: (song) => {
            const responses: Responses = {
                guitar: createResponse(song.ids.guitar),
                bass: createResponse(song.ids.bass),
                vocals: createResponse(song.ids.vocals)
            };

            Object.entries(responses).forEach(([track, response]) => {
                console.log('Downloading:', track);
                response?.then(() => console.log('Downloaded:', track));
            });
        }
    };
}
