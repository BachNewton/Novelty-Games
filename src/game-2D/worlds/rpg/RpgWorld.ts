import { Route, updateRoute } from "../../../ui/Routing";
import { GameWorld } from "../GameWorld";
import { getOverlay } from "./ui/Main";

export function createRpgWorld(): GameWorld {
    updateRoute(Route.RPG);

    return {
        draw: () => {
            // throw new Error("Function not implemented.");
        },

        update: (deltaTime) => {
            // throw new Error("Function not implemented.");
        },

        overlay: getOverlay()
    };
}
