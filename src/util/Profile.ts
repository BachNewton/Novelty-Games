import { createID } from "./ID";
import { createStorer, StorageKey } from "./Storage";

export const DEFAULT_USER_NAME = 'Player';

export interface Profile {
    name: string;
    id: string;
}

export async function getProfile(): Promise<Profile> {
    const storer = createStorer<Profile>();

    return storer.load(StorageKey.PROFILE).catch(() => {
        const profile: Profile = {
            name: DEFAULT_USER_NAME,
            id: createID()
        };

        storer.save(StorageKey.PROFILE, profile);

        return profile;
    });
}

export function updateProfile(profile: Profile) {
    createStorer<Profile>().save(StorageKey.PROFILE, profile);
}
