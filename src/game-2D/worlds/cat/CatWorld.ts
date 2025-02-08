import { Route, updateRoute } from "../../../ui/Routing";
import { GameWorld } from "../GameWorld";

export function createCatWorld(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): GameWorld {
    updateRoute(Route.CAT);

    return {
        draw: () => {
            // console.log("Drawing Cat World");
        },
        update: (deltaTime: number) => {
            // console.log("Updating Cat World");
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
