import http from 'http';
import https from 'https';
import express from 'express';
import fs from 'fs';

export function createServer() {
    if (process.env.NODE_ENV === 'development') {
        return createDevServer();
    } else {
        return createProdServer();
    }
}

function createDevServer() {
    const app = express();
    const server = http.createServer(app);

    console.log('Running in development mode (HTTP)');

    return server;
}

function createProdServer() {
    const PRIVATE_KEY_FILE_PATH = '/etc/letsencrypt/live/novelty-games.mooo.com/privkey.pem';
    const CERTIFICATE_FILE_PATH = '/etc/letsencrypt/live/novelty-games.mooo.com/fullchain.pem';

    const privateKey = fs.readFileSync(PRIVATE_KEY_FILE_PATH, 'utf8');
    const certificate = fs.readFileSync(CERTIFICATE_FILE_PATH, 'utf8');

    const credentials = { key: privateKey, cert: certificate };

    const app = express();
    const server = https.createServer(credentials, app);

    console.log('Running in production mode (HTTPS)');

    return server;
}
