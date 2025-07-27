import default_chat from '../images/default/chat.png';
import default_greet_high_friendship from '../images/default/greet_high_friendship.png';
import default_greet_low_friendship from '../images/default/greet_low_friendship.png';
import default_pet from '../images/default/pet.png';
import default_play from '../images/default/play.png';
import default_sleep from '../images/default/sleep.png';
import default_space from '../images/default/space.png';
import default_treat from '../images/default/treat.png';
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

export const defaultImages: PetImages = {
    chat: default_chat,
    greetHighFriendShip: default_greet_high_friendship,
    greetLowFriendship: default_greet_low_friendship,
    pet: default_pet,
    play: default_play,
    sleep: default_sleep,
    space: default_space,
    treat: default_treat
};

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
