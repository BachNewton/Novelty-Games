import { Axis, Buttons, Controller } from "./Controller";

interface XboxControllerCreator {
    create(onButtonPressed: (button: Button) => void): Controller;
}

export enum Button {
    A = 'A', VIEW = 'VIEW'
}

export const XboxControllerCreator: XboxControllerCreator = {
    create: (onButtonPressed) => {
        window.addEventListener('gamepadconnected', e => console.log('Gamepad connected - id:', e.gamepad.id, 'index:', e.gamepad.index));
        window.addEventListener('gamepaddisconnected', e => console.log('Gamepad disconnected - id:', e.gamepad.id, 'index:', e.gamepad.index));

        const leftAxis: Axis = { x: 0, y: 0 };
        const rightAxis: Axis = { x: 0, y: 0 };
        const pressed: Buttons = { a: false, view: false };

        return {
            leftAxis: leftAxis,
            rightAxis: rightAxis,
            pressed: pressed,
            update: () => {
                const gamepad = navigator.getGamepads()[0];
                if (!gamepad) return;

                leftAxis.x = gamepad.axes[0];
                leftAxis.y = gamepad.axes[1];
                rightAxis.x = gamepad.axes[2];
                rightAxis.y = gamepad.axes[3];

                if (gamepad.buttons[0].pressed !== pressed.a) {
                    pressed.a = gamepad.buttons[0].pressed;

                    if (pressed.a) {
                        onButtonPressed(Button.A);
                    }
                }

                if (gamepad.buttons[8].pressed !== pressed.view) {
                    pressed.view = gamepad.buttons[8].pressed;

                    if (pressed.view) {
                        onButtonPressed(Button.VIEW);
                    }
                }
            }
        };
    }
};
