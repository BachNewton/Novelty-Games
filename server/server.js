import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://192.168.50.75:3000']
    }
});
const PORT = 80;

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
        socket.broadcast.emit('broadcast', data);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
