import FinishSound from '../sounds/finish.wav';
import CollectSound from '../sounds/collect.wav';

export interface Sounds {
    collect: HTMLAudioElement;
    finish: HTMLAudioElement;
}

export function createSounds(): Sounds {
    const collect = new Audio(CollectSound);
    collect.load();

    const finish = new Audio(FinishSound);
    finish.load();

    return {
        collect: collect,
        finish: finish
    };
}
