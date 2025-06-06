/**
 * @typedef {Object} SaveFileEvent
 * 
 * @property {string} id
 * @property {string} application
 * @property {SaveFileData} data
 */

/**
 * @typedef {Object} GetFileEvent
 * 
 * @property {string} id
 * @property {string} application
 * @property {string} folderName
 * @property {string} fileName
 */

/**
 * @typedef {Object} SaveFileData
 * 
 * @property {string} folderName
 * @property {string} fileName
 * @property {string} content
 */

/**
 * @typedef {Object} DeleteFileData
 * 
 * @property {string} folderName
 * @property {string} fileName
 */

/**
 * @typedef {Object} SaveFileResponse
 * 
 * @property {string} id
 * @property {boolean} isSuccessful
 */

/**
 * @typedef {Object} GetFileResponse
 * 
 * @property {string} id
 * @property {boolean} isSuccessful
 * @property {string | null} content
 */

/**
 * @typedef {Object} DownloadFileResponse
 * 
 * @property {string} id
 * @property {Buffer} buffer
 */

/**
 * @typedef {Object} DeleteFileResponse
 * 
 * @property {string} id
 * @property {boolean} isSuccessful
 */

/**
 * @typedef {Object} LogEvent
 * 
 * @property {string} application
 * @property {string} text
 */

/**
 * @typedef {Object} DownloadFileEvent
 * 
 * @property {string} id
 * @property {string} application
 * @property {DownloadFileData} data
 */

/**
 * @typedef {Object} DownloadFileData
 * 
 * @property {string} id
 */
