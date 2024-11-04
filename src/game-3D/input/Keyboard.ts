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
}

interface KeyboardInputCreator {
    create(onKeyPressed: (key: Key) => void): KeyboardInput;
}

export enum Key {
    SPACE = 'SPACE', TAB = 'TAB', X = 'X', BACKSPACE = 'BACKSPACE', C = 'C'
}

enum KeyEventType {
    DOWN, UP
}

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
            c: false
        };

        const handleKeyEvent = (e: KeyboardEvent, type: KeyEventType) => {
            const code = e.code;

            if (code === 'Tab') {
                e.preventDefault();
            }

            if (type === KeyEventType.DOWN) {
                if (code === 'Space' && !held.space) onKeyPressed(Key.SPACE);
                if (code === 'Tab' && !held.tab) onKeyPressed(Key.TAB);
                if (code === 'KeyX' && !held.x) onKeyPressed(Key.X);
                if (code === 'Backspace' && !held.backspace) onKeyPressed(Key.BACKSPACE);
                if (code === 'KeyC' && !held.c) onKeyPressed(Key.C);
            }

            const updatedValue = type === KeyEventType.DOWN ? true : false;

            if (code === 'KeyW') {
                held.w = updatedValue;
            } else if (code === 'KeyA') {
                held.a = updatedValue;
            } else if (code === 'KeyS') {
                held.s = updatedValue;
            } else if (code === 'KeyD') {
                held.d = updatedValue;
            } else if (code === 'Space') {
                held.space = updatedValue;
            } else if (code === 'Tab') {
                held.tab = updatedValue;
            } else if (code === 'KeyX') {
                held.x = updatedValue;
            } else if (code === 'Backspace') {
                held.backspace = updatedValue;
            } else if (code === 'KeyC') {
                held.c = updatedValue;
            }
        };

        window.addEventListener('keydown', e => handleKeyEvent(e, KeyEventType.DOWN));
        window.addEventListener('keyup', e => handleKeyEvent(e, KeyEventType.UP));

        return {
            held: held
        };
    }
};
