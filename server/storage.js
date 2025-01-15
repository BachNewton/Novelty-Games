import fs from 'fs';
import pathTool from 'path';

const MAIN_STORAGE_DIRECTORY = 'storage';
const VALID_STORAGE_DIRECTORY = `/home/kyle1235/Novelty-Games/${MAIN_STORAGE_DIRECTORY}/`;

/**
 * @typedef {Object} SaveFileEvent
 * 
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

/** @param {SaveFileEvent} event */
export async function saveFile(event) {
    console.log(event.application);
    console.log(event.data);

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
    } else {
        console.error("The file's path is not valid:", filePath);
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
