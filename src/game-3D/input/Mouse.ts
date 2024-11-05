export interface MouseInput {
    pointer: Pointer;
}

export interface Pointer {
    x: number;
    y: number;
}

interface MouseInputCreator {
    create(onClick: (pointer: Pointer) => void): MouseInput;
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
            onClick({ x: e.clientX, y: e.clientY });
        });

        return {
            pointer: pointer
        };
    }
};
