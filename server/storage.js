import fs from 'fs';
import pathTool from 'path';

const MAIN_STORAGE_DIRECTORY = 'storage';
const VALID_STORAGE_DIRECTORY = `/home/kyle1235/Novelty-Games/${MAIN_STORAGE_DIRECTORY}/`;

/**
 * @typedef {Object} StorageData
 * 
 * @property {string} folderName - The name of the folder to store into.
 * @property {string} fileName - The name of the file being saved.
 * @property {string} content - The content of the file being saved.
 */

/** @param {StorageData} data */
export async function store(data) {
    const folderName = data.folderName;
    const fileName = data.fileName;
    const content = data.content;

    const path = getPath(folderName);
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

function getPath(folderName) {
    return `${MAIN_STORAGE_DIRECTORY}/${folderName}`;
}

function isPathValid(filePath) {
    const resolvedPath = pathTool.resolve(filePath);
    const isValidFilePath = resolvedPath.startsWith(VALID_STORAGE_DIRECTORY);
    return isValidFilePath;
}
