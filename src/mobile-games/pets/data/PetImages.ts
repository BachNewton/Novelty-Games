import frog_chat from '../images/frog/chat.jpg';
import frog_greet_high_friendship from '../images/frog/greet_high_friendship.jpg';
import frog_greet_low_friendship from '../images/frog/greet_low_friendship.jpg';
import frog_pet from '../images/frog/pet.jpg';
import frog_play from '../images/frog/play.jpg';
import frog_sleep from '../images/frog/sleep.jpg';
import frog_space from '../images/frog/space.jpg';
import frog_treat from '../images/frog/treat.jpg';

export interface PetImages {
    chat: string;
    greetHighFriendShip: string;
    greetLowFriendship: string;
    pet: string;
    play: string;
    sleep: string;
    space: string;
    treat: string;
}

export const frogImages: PetImages = {
    chat: frog_chat,
    greetHighFriendShip: frog_greet_high_friendship,
    greetLowFriendship: frog_greet_low_friendship,
    pet: frog_pet,
    play: frog_play,
    sleep: frog_sleep,
    space: frog_space,
    treat: frog_treat
};
