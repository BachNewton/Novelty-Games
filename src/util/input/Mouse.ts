export interface MouseInput {
    held: HeldButtons;
}

enum MouseButton {
    LEFT = 'Left',
    RIGHT = 'Right'
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
        const mouseButton = buttonToMouseButton(e.button);

        if (mouseButton === null) {
            console.warn(`Unhandled button: ${e.button}`);
            return;
        }

        held[mouseButton] = type === MouseEventType.DOWN ? true : false;
    };

    window.onmousedown = e => handleMouseEvent(e, MouseEventType.DOWN);
    window.onmouseup = e => handleMouseEvent(e, MouseEventType.UP);
    window.oncontextmenu = e => e.preventDefault();

    return {
        held: held
    };
}

function buttonToMouseButton(button: number): MouseButton | null {
    switch (button) {
        case 0: return MouseButton.LEFT;
        case 2: return MouseButton.RIGHT;
        default: return null;
    }
}
