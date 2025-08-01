import { Axis, Buttons, Controller } from "./Controller";
import { Key, keyboardInputCreator } from "./Keyboard";
import { Button, xboxControllerCreator } from "./XboxController";

const DEADZONE = 0.13;

interface GenericControllerCreator {
    create(onButtonPressed: (button: Button) => void): Controller;
}

export const genericControllerCreator: GenericControllerCreator = {
    create: (onButtonPressed) => {
        const xboxController = xboxControllerCreator.create(onButtonPressed);
        const keyboardInput = keyboardInputCreator.create(key => {
            if (key === Key.SPACE) {
                onButtonPressed(Button.A);
            } else if (key === Key.TAB) {
                onButtonPressed(Button.VIEW);
            } else if (key === Key.F) {
                onButtonPressed(Button.LEFT_STICK_IN);
            } else if (key === Key.X) {
                onButtonPressed(Button.RIGHT_STICK_IN);
            } else if (key === Key.BACKSPACE) {
                onButtonPressed(Button.LEFT_D_STICK);
            } else if (key === Key.C) {
                onButtonPressed(Button.RIGHT_D_STICK);
            } else if (key === Key.Q) {
                onButtonPressed(Button.X);
            } else if (key === Key.E) {
                onButtonPressed(Button.Y);
            } else if (key === Key.R) {
                onButtonPressed(Button.B);
            }
        });

        const leftAxis: Axis = { x: 0, y: 0 };
        const rightAxis: Axis = { x: 0, y: 0 };
        const pressed: Buttons = {
            a: false,
            x: false,
            y: false,
            b: false,
            view: false,
            leftStickIn: false,
            rightStickIn: false,
            leftDStick: false,
            rightDStick: false
        };

        return {
            leftAxis: leftAxis,
            rightAxis: rightAxis,
            pressed: pressed,
            update: () => {
                xboxController.update();

                const y = (keyboardInput.held.w ? -1 : 0) + (keyboardInput.held.s ? 1 : 0);
                const x = (keyboardInput.held.d ? 1 : 0) + (keyboardInput.held.a ? -1 : 0);
                const angle = Math.atan2(y, x);
                leftAxis.x = x !== 0 ? Math.cos(angle) : 0;
                leftAxis.y = y !== 0 ? Math.sin(angle) : 0;

                if (Math.abs(xboxController.leftAxis.x) > DEADZONE) leftAxis.x = xboxController.leftAxis.x;
                if (Math.abs(xboxController.leftAxis.y) > DEADZONE) leftAxis.y = xboxController.leftAxis.y;

                rightAxis.x = Math.abs(xboxController.rightAxis.x) > DEADZONE ? xboxController.rightAxis.x : 0;
                rightAxis.y = Math.abs(xboxController.rightAxis.y) > DEADZONE ? xboxController.rightAxis.y : 0;

                pressed.a = keyboardInput.held.space;

                if (xboxController.pressed.a) {
                    pressed.a = true;
                }
            }
        };
    }
};
