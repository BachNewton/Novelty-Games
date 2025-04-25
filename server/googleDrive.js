import { Socket } from 'socket.io';

const URL = 'https://drive.google.com/uc?export=download&id=';

/**
 * @param {DownloadFileEvent} event
 * @param {Socket} socket
 */
export async function downloadFileFromGoogleDrive(event, socket) {
    const id = event.data.id;
    const response = await fetch(URL + id);
    console.log('Response:', response);
}
