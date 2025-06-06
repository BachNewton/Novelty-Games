import { Socket } from 'socket.io';

const URL = 'https://drive.google.com/uc?export=download&id=';
const DOWNLOAD_FILE_RESPONSE_EVENT = 'downloadFileResponse';

/**
 * @param {DownloadFileEvent} event
 * @param {Socket} socket
 */
export async function downloadFileFromGoogleDrive(event, socket) {
    const id = event.id;
    const fileId = event.data.id;
    const url = URL + id;

    console.log('Downloading file from Google Drive:', url);

    const response = await fetch(URL + fileId);

    console.log('Response status:', response.status);

    const buffer = Buffer.from(await response.arrayBuffer());

    console.log('Buffer length:', buffer.length);

    /** @type {DownloadFileResponse} */
    const downloadFileResponse = {
        id: id,
        buffer: buffer
    };

    socket.emit(DOWNLOAD_FILE_RESPONSE_EVENT, downloadFileResponse);
}
