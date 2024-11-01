export interface KeyboardInput extends EventTarget {
    held: Keys;
}

interface Keys {
    KeyW: boolean;
    KeyA: boolean;
    KeyS: boolean;
    KeyD: boolean;
    Space: boolean;
}

interface KeyboardInputCreator {
    create(): KeyboardInput;
}

enum KeyEventType {
    DOWN, UP
}

export const KeyboardInputCreator: KeyboardInputCreator = {
    create: () => {
        const held: Keys = {
            KeyW: false,
            KeyA: false,
            KeyS: false,
            KeyD: false,
            Space: false
        };

        const handleKeyEvent = (code: string, type: KeyEventType) => {
            const updatedValue = type === KeyEventType.DOWN ? true : false;

            if (code === 'KeyW') {
                held.KeyW = updatedValue;
            } else if (code === 'KeyA') {
                held.KeyA = updatedValue;
            } else if (code === 'KeyS') {
                held.KeyS = updatedValue;
            } else if (code === 'KeyD') {
                held.KeyD = updatedValue;
            } else if (code === 'Space') {
                held.Space = updatedValue;
            }
        };

        window.addEventListener('keydown', e => handleKeyEvent(e.code, KeyEventType.DOWN));
        window.addEventListener('keyup', e => handleKeyEvent(e.code, KeyEventType.UP));

        return {
            held: held,
            addEventListener: () => { },
            removeEventListener: () => { },
            dispatchEvent
        };
    }
};
