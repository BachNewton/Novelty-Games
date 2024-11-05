export interface KeyboardInput {
    held: Keys;
}

interface Keys {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    space: boolean;
    tab: boolean;
    x: boolean;
    backspace: boolean;
    c: boolean;
    q: boolean;
    e: boolean;
    r: boolean;
}

interface KeyboardInputCreator {
    create(onKeyPressed: (key: Key) => void): KeyboardInput;
}

export enum Key {
    SPACE = 'SPACE',
    TAB = 'TAB',
    X = 'X',
    BACKSPACE = 'BACKSPACE',
    C = 'C',
    Q = 'Q',
    E = 'E',
    R = 'R'
}

enum KeyEventType {
    DOWN, UP
}

type KeyLookup = [string, keyof Keys, Key | null];

export const KeyboardInputCreator: KeyboardInputCreator = {
    create: (onKeyPressed) => {
        const held: Keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false,
            tab: false,
            x: false,
            backspace: false,
            c: false,
            q: false,
            e: false,
            r: false
        };

        const keyLookups: KeyLookup[] = [
            ['Space', 'space', Key.SPACE],
            ['Tab', 'tab', Key.TAB],
            ['KeyX', 'x', Key.X],
            ['Backspace', 'backspace', Key.BACKSPACE],
            ['KeyC', 'c', Key.C],
            ['KeyQ', 'q', Key.Q],
            ['KeyE', 'e', Key.E],
            ['KeyR', 'r', Key.R],
            ['KeyW', 'w', null],
            ['KeyA', 'a', null],
            ['KeyS', 's', null],
            ['KeyD', 'd', null]
        ];

        const handleKeyEvent = (e: KeyboardEvent, type: KeyEventType) => {
            const code = e.code;

            if (code === 'Tab') {
                e.preventDefault();
            }

            const updatedValue = type === KeyEventType.DOWN ? true : false;

            for (const keyLookup of keyLookups) {
                const lookupCode = keyLookup[0];
                const lookupHeldKey = keyLookup[1];
                const lookupKey = keyLookup[2];

                if (updatedValue && lookupKey !== null && code === lookupCode && !held[lookupHeldKey]) {
                    onKeyPressed(lookupKey);
                }

                if (code === lookupCode) {
                    held[lookupHeldKey] = updatedValue;
                }
            }
        };

        window.addEventListener('keydown', e => handleKeyEvent(e, KeyEventType.DOWN));
        window.addEventListener('keyup', e => handleKeyEvent(e, KeyEventType.UP));

        return {
            held: held
        };
    }
};
