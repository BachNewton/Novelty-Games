import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors({ origin: 'http://localhost:3001' }));
const server = http.createServer(app);
const io = new Server(server);
const PORT = 80;

io.on('connection', (socket) => {
    console.log('Connection:', socket.id);

    // // Handle incoming messages or events from the client
    // socket.on('message', (msg) => {
    //     console.log('Message received:', msg);
    //     // You can broadcast the message to other clients or perform actions
    //     io.emit('message-broadcast', msg);
    // });

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('Disconnect:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
