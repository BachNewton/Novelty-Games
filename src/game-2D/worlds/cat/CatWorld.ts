import { Route, updateRoute } from "../../../ui/Routing";
import { GameWorld } from "../GameWorld";
import { createAnimator, Animation } from "./Animator";
import CAT_SPRITE_SHEET from "./sprites/cat-sheet.png";

export function createCatWorld(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): GameWorld {
    updateRoute(Route.CAT);

    const image = new Image();
    image.src = CAT_SPRITE_SHEET;

    const frameWidth = 32; // Width of a single frame
    const frameHeight = 32; // Height of a single frame
    const framesPerSecond = 2.5; // Animation speed

    const animator = createAnimator(ctx, image, frameWidth, frameHeight, framesPerSecond);
    animator.setDebug(true);

    const animation: Animation = {
        startingWindowX: 0,
        startingWindowY: 0,
        totalWindowsX: 8,
        totalWindowsY: 1
    };

    animator.setAnimation(animation);

    return {
        draw: () => {
            animator.draw(750, 250, 120, 120);
        },
        update: (deltaTime: number) => {
            animator.update(deltaTime);
        },
        onTouchStart: (e: TouchEvent) => {
            // console.log("Touch Start in Cat World");
        },
        onTouchEnd: (e: TouchEvent) => {
            // console.log("Touch End in Cat World");
        },
        onTouchMove: (e: TouchEvent) => {
            // console.log("Touch Move in Cat World");
        },
        onClick: (e: MouseEvent) => {
            // console.log("Click in Cat World");
        },
        onMouseDown: (x: number, y: number) => {
            // console.log("Mouse Down in Cat World");
        },
        onMouseMove: (x: number, y: number) => {
            // console.log("Mouse Move in Cat World");
        },
        onMouseUp: (x: number, y: number) => {
            // console.log("Mouse Up in Cat World");
        }
    };
}
