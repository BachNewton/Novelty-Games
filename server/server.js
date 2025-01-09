import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:https';
import fs from 'fs';

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
        const response = await fecth(`ipinfo.io/${socket.handshake.address}`);
        const json = await response.json();

        console.log(json);

        const isUS = json.country === 'US';
        const isFinland = json.country === 'Finland';

        if (!isUS || !isFinland) return;

        console.log('Connection:', socket.id);
        socket.broadcast.emit('connection', socket.id);

        socket.on('disconnect', () => {
            console.log('Disconnect:', socket.id);
            socket.broadcast.emit('disconnected', socket.id);
        });

        socket.on('broadcast', (data) => {
            console.log('Socket ID:', socket.id, 'Broadcast data:', data);
            socket.broadcast.emit('broadcast', data);
        });
    });

    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

    return server;
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
