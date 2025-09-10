export interface MouseInput {
    held: HeldButtons;
    addClickListener: (listener: ClickListener) => void;
    addScrollListener: (listener: ScrollListener) => void;
    cleanup: () => void;
}

type ScrollListener = (scroll: MouseScroll) => void;

type ClickListener = (click: MouseClick) => void;

enum MouseButton {
    LEFT = 'Left',
    RIGHT = 'Right'
}

export enum MouseScroll { UP, DOWN }

interface MouseClick { x: number, y: number }

type HeldButtons = { [Button in MouseButton]: boolean };

enum MouseEventType {
    DOWN, UP
}

export function createMouseInput(): MouseInput {
    const held = {
        [MouseButton.LEFT]: false,
        [MouseButton.RIGHT]: false
    };

    const clickListeners: ClickListener[] = [];
    const scrollListeners: ScrollListener[] = [];

    const handleMouseEvent = (e: MouseEvent, type: MouseEventType) => {
        const mouseButton = buttonToMouseButton(e.button);

        if (mouseButton === null) {
            console.warn(`Unhandled button: ${e.button}`);
            return;
        }

        held[mouseButton] = type === MouseEventType.DOWN ? true : false;
    };

    const handleScrollEvent = (e: WheelEvent) => {
        if (e.deltaY === 0) return;

        const scroll = e.deltaY > 0 ? MouseScroll.UP : MouseScroll.DOWN;
        scrollListeners.forEach(listener => listener(scroll));
    };

    const handleClickEvent = (e: MouseEvent) => {
        clickListeners.forEach(listener => listener({ x: e.clientX, y: e.clientY }));
    };

    window.onmousedown = e => handleMouseEvent(e, MouseEventType.DOWN);
    window.onmouseup = e => handleMouseEvent(e, MouseEventType.UP);
    window.onclick = handleClickEvent;
    window.onwheel = handleScrollEvent;
    window.oncontextmenu = e => e.preventDefault();

    return {
        held: held,
        addClickListener: (listener) => clickListeners.push(listener),
        addScrollListener: (listener) => scrollListeners.push(listener),
        cleanup: () => {
            clickListeners.length = 0;
            window.onclick = handleClickEvent;
        }
    };
}

function buttonToMouseButton(button: number): MouseButton | null {
    switch (button) {
        case 0: return MouseButton.LEFT;
        case 2: return MouseButton.RIGHT;
        default: return null;
    }
}
