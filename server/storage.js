import fs from 'fs';

const MAIN_STORAGE_DIRECTORY = 'storage';

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
    const fileName = data.folderName;
    const content = data.content;

    const path = getPath(folderName);

    await createDirectory(path);

    await fs.promises.writeFile(`${path}/${fileName}`, content);
}

async function createDirectory(path) {
    if (fs.existsSync(path)) return;

    console.log('Creating path for storage:', path);

    await fs.promises.mkdir(path, { recursive: true });
}

function getPath(folderName) {
    return `${MAIN_STORAGE_DIRECTORY}/${folderName}`;
}
