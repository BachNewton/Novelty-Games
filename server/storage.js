import fs from 'fs';
import pathTool from 'path';
import { Socket } from 'socket.io';

const SAVE_FILE_RESPONSE_EVENT = 'saveFileResponse';
const MAIN_STORAGE_DIRECTORY = 'storage';
const VALID_STORAGE_DIRECTORY = `/home/kyle1235/Novelty-Games/${MAIN_STORAGE_DIRECTORY}/`;

/**
 * @typedef {Object} SaveFileEvent
 * 
 * @property {string} id
 * @property {string} application
 * @property {SaveFileData} data
 */

/**
 * @typedef {Object} SaveFileData
 * 
 * @property {string} folderName
 * @property {string} fileName
 * @property {string} content
 */

/**
 * @typedef {Object} SaveFileResponse
 * 
 * @property {string} id
 * @property {boolean} isSuccessful
 */

/**
 * @param {SaveFileEvent} event
 * @param {Socket} socket
 */
export async function saveFile(event, socket) {
    const id = event.id;
    const applicationName = event.application;
    const folderName = event.data.folderName;
    const fileName = event.data.fileName;
    const content = event.data.content;

    const path = getPath(applicationName, folderName);
    const filePath = `${path}/${fileName}`;

    if (isPathValid(filePath)) {
        await createDirectory(path);

        console.log('Writing to file:', filePath);

        await fs.promises.writeFile(filePath, content);

        console.log('Writing to file complete!');

        /** @type {SaveFileResponse} */
        const saveFileResponse = { id: id, isSuccessful: true };
        socket.emit(SAVE_FILE_RESPONSE_EVENT, saveFileResponse);
    } else {
        console.error("The file's path is not valid:", filePath);

        /** @type {SaveFileResponse} */
        const saveFileResponse = { id: id, isSuccessful: false };
        socket.emit(SAVE_FILE_RESPONSE_EVENT, saveFileResponse);
    }
}

async function createDirectory(path) {
    if (fs.existsSync(path)) return;

    console.log('Creating path for storage:', path);

    await fs.promises.mkdir(path, { recursive: true });
}

function getPath(applicationName, folderName) {
    return `${MAIN_STORAGE_DIRECTORY}/${applicationName}/${folderName}`;
}

function isPathValid(filePath) {
    const resolvedPath = pathTool.resolve(filePath);
    const isValidFilePath = resolvedPath.startsWith(VALID_STORAGE_DIRECTORY);

    return isValidFilePath;
}
