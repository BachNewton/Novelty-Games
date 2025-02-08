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
    const framesPerSecond = 4; // Animation speed

    const animations: Animation[] = [
        { startingWindowX: 0, startingWindowY: 0, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 1, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 2, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 3, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 4, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 5, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 6, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 7, totalWindowsX: 2, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 8, totalWindowsX: 3, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 9, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 10, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 11, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 12, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 13, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 14, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 15, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 16, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 17, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 18, totalWindowsX: 8, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 19, totalWindowsX: 4, totalWindowsY: 2 },
        { startingWindowX: 0, startingWindowY: 21, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 22, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 23, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 24, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 25, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 26, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 27, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 28, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 29, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 30, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 31, totalWindowsX: 4, totalWindowsY: 1 },
        { startingWindowX: 0, startingWindowY: 32, totalWindowsX: 4, totalWindowsY: 1 }
    ];

    const animators = Array.from({ length: animations.length }, () => createAnimator(ctx, image, frameWidth, frameHeight, framesPerSecond));

    animators.forEach((animator, index) => animator.setAnimation(animations[index]));

    // animators[animations.length - 1].setAnimation(animations[animations.length - 1]);
    // animators[animations.length - 1].setDebug(true);

    return {
        draw: () => {
            const cols = 4;
            const size = canvas.width / cols;

            animators.forEach((animator, index) => {
                const width = size * (index % cols);
                const height = size * Math.floor(index / cols);
                animator.draw(width, height, size, size);
            });
        },
        update: (deltaTime: number) => {
            animators.forEach(animator => animator.update(deltaTime));
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
