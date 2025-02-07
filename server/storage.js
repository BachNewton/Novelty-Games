import fs from 'fs';
import pathTool from 'path';
import { Socket } from 'socket.io';

const SAVE_FILE_RESPONSE_EVENT = 'saveFileResponse';
const GET_FILE_RESPONSE_EVENT = 'getFileResponse';
const DELETE_FILE_RESPONSE_EVENT = 'deleteFileResponse';
const MAIN_STORAGE_DIRECTORY = 'storage';
const VALID_STORAGE_DIRECTORY = `/home/kyle1235/Novelty-Games/${MAIN_STORAGE_DIRECTORY}/`;

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

/**
 * @param {GetFileEvent} event
 * @param {Socket} socket
 */
export async function getFile(event, socket) {
    const id = event.id;
    const applicationName = event.application;
    const folderName = event.data.folderName;
    const fileName = event.data.fileName;

    const path = getPath(applicationName, folderName);
    const filePath = `${path}/${fileName}`;

    if (isPathValid(filePath)) {
        console.log('Reading file:', filePath);

        const content = await fs.promises.readFile(filePath, 'utf8').catch(() => null);

        console.log('Read file - content:', content);

        /** @type {GetFileResponse} */
        const getFileResponse = {
            id: id,
            isSuccessful: content !== null,
            content: content
        };

        socket.emit(GET_FILE_RESPONSE_EVENT, getFileResponse);
    } else {
        console.error("The file's path is not valid:", filePath);

        /** @type {GetFileResponse} */
        const getFileResponse = {
            id: id,
            isSuccessful: false,
            content: null
        };

        socket.emit(GET_FILE_RESPONSE_EVENT, getFileResponse);
    }
}

/**
 * @param {DeleteFileData} event
 * @param {Socket} socket
 */
export async function deleteFile(event, socket) {
    const id = event.id;
    const applicationName = event.application;
    const folderName = event.data.folderName;
    const fileName = event.data.fileName;

    const path = getPath(applicationName, folderName);
    const filePath = `${path}/${fileName}`;

    if (isPathValid(filePath)) {
        console.log('Deleting file:', filePath);

        await fs.promises.unlink(filePath);

        console.log('File deleted!');

        /** @type {DeleteFileResponse} */
        const deleteFileResponse = {
            id: id,
            isSuccessful: true,
        };

        socket.emit(DELETE_FILE_RESPONSE_EVENT, deleteFileResponse);
    } else {
        console.error("The file's path is not valid:", filePath);

        /** @type {DeleteFileResponse} */
        const deleteFileResponse = {
            id: id,
            isSuccessful: false,
        };

        socket.emit(DELETE_FILE_RESPONSE_EVENT, deleteFileResponse);
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
