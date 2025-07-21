export interface Dialogue {
    hidden: string;
    greeting: string;
    sleeping: string;
}

export function getDefaultDialogue(): Dialogue {
    return {
        hidden: 'Hello, I am a pet. I am awake and this is my dialogue. This game is a work in progress. In the future I will say some really cute things. Right now you can greet me, pet me, or feed me. But these are just some placeholder options and they don\'t do anything.',
        greeting: 'I am a pet and I am hidden. Come find me!',
        sleeping: 'I am a sleeping pet. I don\'t want to interact right now. How about you come back later when I am awake?'
    };
}

export const ellaDialog: Dialogue = {
    hidden: 'This is the hidden dialog',
    greeting: 'This is the greeting dialog',
    sleeping: 'This is the sleeping dialog'
};
