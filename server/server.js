import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:https';
import fs from 'fs';
import { saveFile } from './storage.js';

const PORT = 443;
const PRIVATE_KEY_FILE_PATH = '/etc/letsencrypt/live/novelty-games.mooo.com/privkey.pem';
const CERTIFICATE_FILE_PATH = '/etc/letsencrypt/live/novelty-games.mooo.com/fullchain.pem';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function startServer() {
    const privateKey = fs.readFileSync(PRIVATE_KEY_FILE_PATH, 'utf8');
    const certificate = fs.readFileSync(CERTIFICATE_FILE_PATH, 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const app = express();
    const server = createServer(credentials, app);
    const io = new Server(server, {
        cors: {
            origin: ['https://bachnewton.github.io', 'http://localhost:3000']
        }
    });

    app.get('/', (_, res) => {
        res.send('<h1>Novelty Games Server</h1>');
    });

    io.on('connection', async (socket) => {
        if (await isCountryBlocked(getIP(socket))) {
            console.error('This country is blocked!');
            socket.disconnect();
            return;
        }

        console.log('Connection - ID:', socket.id);
        socket.broadcast.emit('connection', socket.id);

        socket.on('disconnect', () => {
            console.log('Disconnect - ID:', socket.id);
            socket.broadcast.emit('disconnected', socket.id);
        });

        socket.on('broadcast', (data) => {
            console.log('Socket ID:', socket.id, 'Broadcast data:', data);
            socket.broadcast.emit('broadcast', data);
        });

        socket.on('saveFile', (event) => {
            console.log('Socket ID:', socket.id, 'SaveFileEvent:', event);
            saveFile(event, socket);
        });
    });

    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

    return server;
}

function getIP(socket) {
    const remoteAddress = socket.conn.remoteAddress;
    console.log('remoteAddress:', remoteAddress);

    const ip = remoteAddress.charAt('.') === -1
        ? remoteAddress
        : remoteAddress.replace('::ffff:', '');
    console.log('ip:', ip);

    return ip;
}

async function isCountryBlocked(ip) {
    const response = await fetch(`https://ipinfo.io/${ip}`, { headers: { accept: 'application/json' } });
    const json = await response.json();
    const country = json.country;

    console.log('Connected Country:', country);

    const isUS = country === 'US';
    const isFinland = country === 'FI';

    return !isUS && !isFinland;
}

(async () => {
    while (true) {
        console.log('Creating server');
        const server = startServer();
        console.log('Waiting one week');
        await new Promise(resolve => setTimeout(resolve, ONE_WEEK_MS));
        console.log('Closing server');
        server.close();
        await new Promise(resolve => server.on('close', resolve));
        console.log('Server closed');
    }
})();
