export interface MouseInput {
    pointer: Pointer;
}

export interface Pointer {
    x: number;
    y: number;
}

interface MouseInputCreator {
    create(onClick: (pointer: Pointer, target: EventTarget | null) => void): MouseInput;
}

export const MouseInputCreator: MouseInputCreator = {
    create: (onClick) => {
        const pointer: Pointer = {
            x: 0,
            y: 0
        };

        window.addEventListener('mousemove', e => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        });

        window.addEventListener('mousedown', e => {
            if (e.button !== MouseButton.LEFT) return;

            onClick({ x: e.clientX, y: e.clientY }, e.target);
        });

        return {
            pointer: pointer
        };
    }
};

enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2
}
