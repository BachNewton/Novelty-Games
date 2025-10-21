import { Axis } from "./Axis";

export enum Key {
    SPACE = 'Space',
    TAB = 'Tab',
    W = 'KeyW',
    A = 'KeyA',
    S = 'KeyS',
    D = 'KeyD'
}

type HeldKeys = { [K in Key]: boolean };
type KeyListener = (key: Key) => void;

export interface KeyboardInput {
    held: HeldKeys;
    movementAxis: Axis;
    addKeyListener: (listener: KeyListener) => void;
}

enum KeyEventType {
    DOWN, UP
}

export function createKeyboardInput(): KeyboardInput {
    const held = {
        [Key.SPACE]: false,
        [Key.TAB]: false,
        [Key.W]: false,
        [Key.A]: false,
        [Key.S]: false,
        [Key.D]: false
    };

    const keyListeners: KeyListener[] = [];

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
            for (const listener of keyListeners) {
                listener(key);
            }
        }

        held[key] = type === KeyEventType.DOWN ? true : false;
    };

    window.onkeydown = e => handleKeyEvent(e, KeyEventType.DOWN);
    window.onkeyup = e => handleKeyEvent(e, KeyEventType.UP);

    return {
        held: held,
        get movementAxis() {
            return getMovementAxis(held);
        },
        addKeyListener: (keyListener) => keyListeners.push(keyListener)
    };
}

function getMovementAxis(held: HeldKeys): Axis {
    const axis: Axis = { x: 0, y: 0 };

    if (held.KeyW) {
        axis.y += 1;
    }

    if (held.KeyS) {
        axis.y -= 1;
    }

    if (held.KeyA) {
        axis.x -= 1;
    }

    if (held.KeyD) {
        axis.x += 1;
    }

    // Normalize to keep the axis within a unit circle
    const length = Math.hypot(axis.x, axis.y);

    if (length > 0) {
        axis.x /= length;
        axis.y /= length;
    }

    return axis;
}
