export interface Dialogue {
    hidden: string;
    greeting: string;
    sleeping: string;
}

export function getDefaultDialogue(): Dialogue {
    return {
        hidden: 'I am a pet and I am hidden. Come find me!',
        greeting: 'Hello, I am a pet. I am awake and this is my dialogue. This game is a work in progress. In the future I will say some really cute things. How about you try some of my interactions below?',
        sleeping: 'I am a sleeping pet. I don\'t want to interact right now. How about you come back later when I am awake?'
    };
}

export const ellaDialog: Dialogue = {
    hidden: 'Oh, this is new. Where am I?',
    greeting: 'Oh hi! Who are you? sniff I don\'t know you, but you seem interesting.',
    sleeping: 'ignore'
};

export const doryDialog: Dialogue = {
    hidden: 'Oh my god! What is this? How did I get here? I better find a place to hide!',
    greeting: 'Um… hello. I\'m not so sure about y—wait, are those treats?? You\'re my new best friend.',
    sleeping: 'Hrmph. Unless you\'ve got food, don\'t bother. I need my beauty sleep.'
};
