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
import ziggy_chat from '../images/ziggy/chat.jpeg';
import ziggy_greet_high_friendship from '../images/ziggy/greet_high_friendship.jpeg';
import ziggy_greet_low_friendship from '../images/ziggy/greet_low_friendship.jpeg';
import ziggy_pet from '../images/ziggy/pet.jpeg';
import ziggy_play from '../images/ziggy/play.jpeg';
import ziggy_sleep from '../images/ziggy/sleep.jpeg';
import ziggy_space from '../images/ziggy/space.jpeg';
import ziggy_treat from '../images/ziggy/treat.jpeg';
import alby_chat from '../images/alby/chat.jpeg';
import alby_greet_high_friendship from '../images/alby/greet_high_friendship.jpeg';
import alby_greet_low_friendship from '../images/alby/greet_low_friendship.jpeg';
import alby_pet from '../images/alby/pet.jpeg';
import alby_play from '../images/alby/play.jpeg';
import alby_sleep from '../images/alby/sleep.jpeg';
import alby_space from '../images/alby/space.jpeg';
import alby_treat from '../images/alby/treat.jpeg';

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

export const ziggyImages: PetImages = {
    chat: ziggy_chat,
    greetHighFriendShip: ziggy_greet_high_friendship,
    greetLowFriendship: ziggy_greet_low_friendship,
    pet: ziggy_pet,
    play: ziggy_play,
    sleep: ziggy_sleep,
    space: ziggy_space,
    treat: ziggy_treat
};

export const albyImages: PetImages = {
    chat: alby_chat,
    greetHighFriendShip: alby_greet_high_friendship,
    greetLowFriendship: alby_greet_low_friendship,
    pet: alby_pet,
    play: alby_play,
    sleep: alby_sleep,
    space: alby_space,
    treat: alby_treat
};
