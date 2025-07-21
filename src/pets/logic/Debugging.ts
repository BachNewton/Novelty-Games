import { createDatabase } from "../../util/database/v1/DatabaseImpl";
import { Pet } from "../data/Pet";

export function debugNextCycle(pet: Pet): string {
    if (pet.nextCycle === null) return 'N/A';

    return `${((pet.nextCycle - Date.now()) / 1000).toFixed(0)}s`;
}

export async function debugResetAllData() {
    await createDatabase('pets', []).delete();
    window.location.reload();
}
