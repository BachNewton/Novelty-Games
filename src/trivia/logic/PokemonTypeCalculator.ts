import { PokemonType, PokemonTyping } from "../data/PokemonData";

export function getEffectiveness(attackingType: PokemonType, defendingTyping: PokemonTyping): number {
    const primaryEffectiveness = getEffectivenessAgainstType(attackingType, defendingTyping.primary);
    const secondaryEffectiveness = defendingTyping.secondary === null ? 1 : getEffectivenessAgainstType(attackingType, defendingTyping.secondary);

    return primaryEffectiveness * secondaryEffectiveness;
}

function getEffectivenessAgainstType(attackingType: PokemonType, defendingType: PokemonType): number {
    switch (attackingType) {
        case PokemonType.NORMAL:
            switch (defendingType) {
                case PokemonType.ROCK:
                case PokemonType.STEEL:
                    return 0.5;
                case PokemonType.GHOST:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.FIRE:
            switch (defendingType) {
                case PokemonType.GRASS:
                case PokemonType.ICE:
                case PokemonType.BUG:
                case PokemonType.STEEL:
                    return 2;
                case PokemonType.FIRE:
                case PokemonType.WATER:
                case PokemonType.DRAGON:
                case PokemonType.ROCK:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.WATER:
            switch (defendingType) {
                case PokemonType.FIRE:
                case PokemonType.GROUND:
                case PokemonType.ROCK:
                    return 2;
                case PokemonType.WATER:
                case PokemonType.GRASS:
                case PokemonType.DRAGON:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.GRASS:
            switch (defendingType) {
                case PokemonType.WATER:
                case PokemonType.ROCK:
                case PokemonType.GROUND:
                    return 2;
                case PokemonType.FIRE:
                case PokemonType.GRASS:
                case PokemonType.POISON:
                case PokemonType.FLYING:
                case PokemonType.BUG:
                case PokemonType.DRAGON:
                case PokemonType.STEEL:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.ELECTRIC:
            switch (defendingType) {
                case PokemonType.WATER:
                case PokemonType.FLYING:
                    return 2;
                case PokemonType.ELECTRIC:
                case PokemonType.GRASS:
                case PokemonType.DRAGON:
                    return 0.5;
                case PokemonType.GROUND:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.ICE:
            switch (defendingType) {
                case PokemonType.GRASS:
                case PokemonType.GROUND:
                case PokemonType.FLYING:
                case PokemonType.DRAGON:
                    return 2;
                case PokemonType.FIRE:
                case PokemonType.WATER:
                case PokemonType.ICE:
                case PokemonType.STEEL:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.FIGHTING:
            switch (defendingType) {
                case PokemonType.NORMAL:
                case PokemonType.ICE:
                case PokemonType.ROCK:
                case PokemonType.DARK:
                case PokemonType.STEEL:
                    return 2;
                case PokemonType.POISON:
                case PokemonType.FLYING:
                case PokemonType.PSYCHIC:
                case PokemonType.BUG:
                case PokemonType.FAIRY:
                    return 0.5;
                case PokemonType.GHOST:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.POISON:
            switch (defendingType) {
                case PokemonType.GRASS:
                case PokemonType.FAIRY:
                    return 2;
                case PokemonType.POISON:
                case PokemonType.GROUND:
                case PokemonType.ROCK:
                case PokemonType.GHOST:
                    return 0.5;
                case PokemonType.STEEL:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.GROUND:
            switch (defendingType) {
                case PokemonType.FIRE:
                case PokemonType.ELECTRIC:
                case PokemonType.POISON:
                case PokemonType.ROCK:
                case PokemonType.STEEL:
                    return 2;
                case PokemonType.GRASS:
                case PokemonType.BUG:
                    return 0.5;
                case PokemonType.FLYING:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.FLYING:
            switch (defendingType) {
                case PokemonType.GRASS:
                case PokemonType.FIGHTING:
                case PokemonType.BUG:
                    return 2;
                case PokemonType.ELECTRIC:
                case PokemonType.ROCK:
                case PokemonType.STEEL:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.PSYCHIC:
            switch (defendingType) {
                case PokemonType.FIGHTING:
                case PokemonType.POISON:
                    return 2;
                case PokemonType.PSYCHIC:
                case PokemonType.STEEL:
                    return 0.5;
                case PokemonType.DARK:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.BUG:
            switch (defendingType) {
                case PokemonType.GRASS:
                case PokemonType.PSYCHIC:
                case PokemonType.DARK:
                    return 2;
                case PokemonType.FIRE:
                case PokemonType.FIGHTING:
                case PokemonType.POISON:
                case PokemonType.FLYING:
                case PokemonType.GHOST:
                case PokemonType.STEEL:
                case PokemonType.FAIRY:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.ROCK:
            switch (defendingType) {
                case PokemonType.FIRE:
                case PokemonType.ICE:
                case PokemonType.FLYING:
                case PokemonType.BUG:
                    return 2;
                case PokemonType.FIGHTING:
                case PokemonType.GROUND:
                case PokemonType.STEEL:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.GHOST:
            switch (defendingType) {
                case PokemonType.PSYCHIC:
                case PokemonType.GHOST:
                    return 2;
                case PokemonType.DARK:
                    return 0.5;
                case PokemonType.NORMAL:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.DRAGON:
            switch (defendingType) {
                case PokemonType.DRAGON:
                    return 2;
                case PokemonType.STEEL:
                    return 0.5;
                case PokemonType.FAIRY:
                    return 0;
                default:
                    return 1;
            }
        case PokemonType.DARK:
            switch (defendingType) {
                case PokemonType.PSYCHIC:
                case PokemonType.GHOST:
                    return 2;
                case PokemonType.FIGHTING:
                case PokemonType.DARK:
                case PokemonType.FAIRY:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.STEEL:
            switch (defendingType) {
                case PokemonType.ICE:
                case PokemonType.ROCK:
                case PokemonType.FAIRY:
                    return 2;
                case PokemonType.FIRE:
                case PokemonType.WATER:
                case PokemonType.ELECTRIC:
                case PokemonType.STEEL:
                    return 0.5;
                default:
                    return 1;
            }
        case PokemonType.FAIRY:
            switch (defendingType) {
                case PokemonType.FIGHTING:
                case PokemonType.DRAGON:
                case PokemonType.DARK:
                    return 2;
                case PokemonType.FIRE:
                case PokemonType.POISON:
                case PokemonType.STEEL:
                    return 0.5;
                default:
                    return 1;
            }
        default:
            return 1;
    }
}
