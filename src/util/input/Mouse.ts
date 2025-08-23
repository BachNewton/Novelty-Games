export interface MouseInput {
    held: HeldButtons;
}

enum MouseButton {
    LEFT = 0,
    RIGHT = 2
}

type HeldButtons = { [Button in MouseButton]: boolean };

enum MouseEventType {
    DOWN, UP
}

export function createMouseInput(): MouseInput {
    const held = {
        [MouseButton.LEFT]: false,
        [MouseButton.RIGHT]: false
    };

    const handleMouseEvent = (e: MouseEvent, type: MouseEventType) => {
        const button = e.button as MouseButton;

        if (!(button in held)) {
            console.warn(`Unhandled button: ${button}`);
            return;
        }

        held[button] = type === MouseEventType.DOWN ? true : false;
    };

    window.onmousedown = e => handleMouseEvent(e, MouseEventType.DOWN);
    window.onmouseup = e => handleMouseEvent(e, MouseEventType.UP);

    return {
        held: held
    };
}
