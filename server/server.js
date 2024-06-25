import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:https';
import fs from 'fs';

const privateKey = fs.readFileSync('/etc/letsencrypt/live/novelty-games.mooo.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/novelty-games.mooo.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
const server = createServer(credentials, app);
const io = new Server(server, {
    cors: {
        origin: ['https://bachnewton.github.io']
    }
});

const PORT = 443;

app.get('/', (_, res) => {
    res.send('<h1>Novelty Games Server</h1>');
});

io.on('connection', (socket) => {
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
