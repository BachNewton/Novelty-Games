import { Socket } from "socket.io";
import { Game } from "./Data";
import io from 'socket.io-client';
import { DefaultEventsMap } from "socket.io/dist/typed-events";

interface Temp extends Event {

}

const SERVER_URL = 'http://35.184.159.91/';

export class Communicator extends EventTarget {
    private socket = io(window.location.hostname === 'localhost' ? 'http://localhost/' : SERVER_URL);

    constructor() {
        super();

        this.socket.on('connect', () => {
            console.log(`You connected to the server with ID: ${this.socket.id}`);
        });

        this.socket.on('connection', (id: string) => {
            console.log(`ID: ${id} connected to the server`);
        });

        this.socket.on('disconnect', (id: string) => {
            console.log(`You disconnected from server with ID: ${this.socket.id}`);
        });

        this.socket.on('disconnected', (id: string) => {
            console.log(`ID: ${id} disconnected from the server`);
        });
    }

    startGame(game: Game) {
        this.socket.emit('message');
    }
}
