import { Card } from "./Card";
import { Team } from "./Data";
// import io from 'socket.io-client';

export class PLAY_CARD_EVENT extends Event {
    static TYPE = 'PLAY_CARD';

    card: Card;
    targetTeam: Team

    constructor(card: Card, targetTeam: Team) {
        super(PLAY_CARD_EVENT.TYPE);

        this.card = card;
        this.targetTeam = targetTeam;
    }
}

const SERVER_URL = 'http://35.184.159.91/';

export class Communicator extends EventTarget {
    // private socket = io(window.location.hostname === 'localhost' ? 'http://localhost/' : SERVER_URL);

    constructor() {
        super();

        // this.socket.on('connect', () => {
        //     console.log(`You connected to the server with ID: ${this.socket.id}`);
        // });

        // this.socket.on('connection', (id: string) => {
        //     console.log(`ID: ${id} connected to the server`);
        // });

        // this.socket.on('disconnect', (id: string) => {
        //     console.log(`You disconnected from server with ID: ${this.socket.id}`);
        // });

        // this.socket.on('disconnected', (id: string) => {
        //     console.log(`ID: ${id} disconnected from the server`);
        // });
    }

    playCard(card: Card, targetTeam: Team) {
        //
    }
}
