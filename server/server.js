import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000'
    }
});
const PORT = 80;

app.get('/', (_, res) => {
    res.send('<h1>Novelty Games Server</h1>');
});

io.on('connection', (socket) => {
    console.log('Connection:', socket.id);

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('Disconnect:', socket.id);
    });

    // // Handle incoming messages or events from the client
    // socket.on('message', msg => {
    //     console.log('Message received:', msg);
    //     // You can broadcast the message to other clients or perform actions
    //     io.emit('message-broadcast', msg);
    // });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
