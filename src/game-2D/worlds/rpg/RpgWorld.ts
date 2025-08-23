import { Route, updateRoute } from "../../../ui/Routing";
import { GameWorld } from "../GameWorld";

export function createRpgWorld(): GameWorld {
    updateRoute(Route.RPG);

    return {
        draw: () => {
            // throw new Error("Function not implemented.");
        },

        update: (deltaTime) => {
            // throw new Error("Function not implemented.");
        }
    };
}
