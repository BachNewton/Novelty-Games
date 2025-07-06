export interface KeyboardInput {
    held: { [K in Key]: boolean };
}

export enum Key {
    SPACE = 'Space',
    TAB = 'Tab',
    W = 'KeyW',
    A = 'KeyA',
    S = 'KeyS',
    D = 'KeyD'
}

enum KeyEventType {
    DOWN, UP
}

export function createKeyboardInput(onKeyPressed: (key: Key) => void): KeyboardInput {
    const held = {
        [Key.SPACE]: false,
        [Key.TAB]: false,
        [Key.W]: false,
        [Key.A]: false,
        [Key.S]: false,
        [Key.D]: false
    };

    const handleKeyEvent = (e: KeyboardEvent, type: KeyEventType) => {
        const key = e.code as Key;

        if (!(key in held)) {
            console.warn(`Unhandled key: ${key}`);
            return;
        }

        if (key === Key.TAB) {
            e.preventDefault();
        }

        if (type === KeyEventType.DOWN && !held[key]) {
            onKeyPressed(key);
        }

        held[key] = type === KeyEventType.DOWN ? true : false;
    };

    window.onkeydown = e => handleKeyEvent(e, KeyEventType.DOWN);
    window.onkeyup = e => handleKeyEvent(e, KeyEventType.UP);

    return {
        held: held
    };
}
