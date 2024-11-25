import { Axis, Buttons, Controller } from "./Controller";

interface XboxControllerCreator {
    create(onButtonPressed: (button: Button) => void): Controller;
}

export enum Button {
    A = 'A',
    X = 'X',
    Y = 'Y',
    B = 'B',
    VIEW = 'VIEW',
    RIGHT_STICK_IN = 'RIGHT_STICK_IN',
    LEFT_D_STICK = 'LEFT_D_STICK',
    RIGHT_D_STICK = 'RIGHT_D_STICK'
}

type ButtonLookup = [number, Button, keyof Buttons];

export const XboxControllerCreator: XboxControllerCreator = {
    create: (onButtonPressed) => {
        window.addEventListener('gamepadconnected', e => console.log('Gamepad connected - id:', e.gamepad.id, 'index:', e.gamepad.index));
        window.addEventListener('gamepaddisconnected', e => console.log('Gamepad disconnected - id:', e.gamepad.id, 'index:', e.gamepad.index));

        const leftAxis: Axis = { x: 0, y: 0 };
        const rightAxis: Axis = { x: 0, y: 0 };
        const pressed: Buttons = {
            a: false,
            x: false,
            y: false,
            b: false,
            view: false,
            rightStickIn: false,
            leftDStick: false,
            rightDStick: false
        };

        const buttonLookups: ButtonLookup[] = [
            [0, Button.A, 'a'],
            [8, Button.VIEW, 'view'],
            [11, Button.RIGHT_STICK_IN, 'rightStickIn']
        ];

        const updateButtons = (gamepad: Gamepad) => {
            for (const buttonLookup of buttonLookups) {
                const index = buttonLookup[0];
                const button = buttonLookup[1];
                const buttonKey = buttonLookup[2];

                const gamepadPressed = gamepad.buttons[index].pressed;

                if (gamepadPressed !== pressed[buttonKey]) {
                    pressed[buttonKey] = gamepadPressed;

                    if (pressed[buttonKey]) {
                        onButtonPressed(button);
                    }
                }
            }
        };

        return {
            leftAxis: leftAxis,
            rightAxis: rightAxis,
            pressed: pressed,
            update: () => {
                const gamepad = getGamepad();
                if (!gamepad) return;

                leftAxis.x = gamepad.axes[0];
                leftAxis.y = gamepad.axes[1];
                rightAxis.x = gamepad.axes[2];
                rightAxis.y = gamepad.axes[3];

                const leftAxisMagnitude = Math.hypot(leftAxis.x, leftAxis.y);
                const rightAxisMagnitude = Math.hypot(rightAxis.x, rightAxis.y);

                if (leftAxisMagnitude > 1) {
                    leftAxis.x /= leftAxisMagnitude;
                    leftAxis.y /= leftAxisMagnitude;
                }

                if (rightAxisMagnitude > 1) {
                    rightAxis.x /= rightAxisMagnitude;
                    rightAxis.y /= rightAxisMagnitude;
                }

                updateButtons(gamepad);
            }
        };
    }
};

function getGamepad(): Gamepad | null {
    for (const gamepad of navigator.getGamepads()) {
        if (gamepad !== null) {
            return gamepad;
        }
    }

    return null;
}
