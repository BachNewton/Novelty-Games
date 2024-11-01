import { Axis, Buttons, Controller } from "./Controller";
import { Key, KeyboardInputCreator } from "./Keyboard";
import { Button, XboxControllerCreator } from "./XboxController";

const DEADZONE = 0.1;

interface GenericControllerCreator {
    create(onButtonPressed: (button: Button) => void): Controller;
}

export const GenericControllerCreator: GenericControllerCreator = {
    create: (onButtonPressed) => {
        const xboxController = XboxControllerCreator.create(onButtonPressed);
        const keyboardInput = KeyboardInputCreator.create(key => {
            if (key === Key.SPACE) {
                onButtonPressed(Button.A);
            } else if (key === Key.TAB) {
                onButtonPressed(Button.VIEW);
            }
        });

        const leftAxis: Axis = { x: 0, y: 0 };
        const rightAxis: Axis = { x: 0, y: 0 };
        const pressed: Buttons = { a: false, view: false };

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
            }
        };
    }
};
