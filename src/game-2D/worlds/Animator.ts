// ## 1. Core Interfaces (with Generic Updates)

export interface Animator<A extends Record<string, any>> {
    play: (animationName: keyof A) => void;
    getFrame: () => AnimationFrame | null;
}

// No changes to AnimationFrame
export interface AnimationFrame {
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
    debug: boolean;
}

// No changes to SpritesheetProperties
interface SpritesheetProperties {
    src: string;
    rows: number;
    cols: number;
    padding: number;
}

// AnimationProperties is now generic. It must be created with a type
// that represents the valid keys for a spritesheet.
interface AnimationProperties<SpritesheetKey extends string> {
    imageKey: SpritesheetKey; // This property is now strongly typed
    startingRow: number;
    startingCol: number;
    frames: number;
}


// ## 2. The Updated `createAnimator` Function

/**
 * Creates a type-safe animator for sprite sheets.
 * @param properties - The animator properties.
 * @param properties.spritesheets - A map of unique keys to spritesheet configurations.
 * @param properties.animations - A map of animations, where each animation's `imageKey`
 * MUST be a key from the `spritesheets` map.
 * @param properties.frameRate - The delay in milliseconds between animation frames.
 * @param debug - Renders debug outlines if true.
 */
export function createAnimator<
    S extends Record<string, SpritesheetProperties>,
    A extends Record<string, AnimationProperties<keyof S & string>>
>(
    properties: {
        spritesheets: S;
        animations: A;
        frameRate: number;
    },
    debug: boolean = false
): Animator<A> { // The returned animator is typed to only accept keys from `A`.

    // Load all provided spritesheets into a map of HTMLImageElement objects.
    const images: Record<string, HTMLImageElement> = {};
    for (const key in properties.spritesheets) {
        const image = new Image();
        image.src = properties.spritesheets[key].src;
        images[key] = image;
    }

    // State for the currently playing animation
    let animation: AnimationProperties<keyof S & string> | null = null;
    let currentSpritesheet: SpritesheetProperties | null = null;
    let currentImage: HTMLImageElement | null = null;
    let time = -1;
    let frame: AnimationFrame | null = null;
    let col = -1;
    let row = -1;
    let width = 0;
    let height = 0;

    return {
        play: (animationName) => {
            const newAnimation = properties.animations[animationName];
            if (animation === newAnimation) return;

            animation = newAnimation;
            // `animation.imageKey` is now guaranteed to be a valid key of `spritesheets`
            currentSpritesheet = properties.spritesheets[animation.imageKey];
            currentImage = images[animation.imageKey as string];

            if (!currentSpritesheet || !currentImage) {
                // This error should now be unreachable if the code compiles,
                // but it's good defensive programming.
                console.error(`Animator Error: Spritesheet with key "${String(animation.imageKey)}" not found.`);
                animation = null;
                return;
            }

            width = currentImage.width / currentSpritesheet.cols;
            height = currentImage.height / currentSpritesheet.rows;

            time = performance.now();
            col = animation.startingCol;
            row = animation.startingRow;

            frame = {
                image: currentImage,
                x: col * width + currentSpritesheet.padding,
                y: row * height + currentSpritesheet.padding,
                width: width - (currentSpritesheet.padding * 2),
                height: height - (currentSpritesheet.padding * 2),
                debug: debug
            };
        },

        getFrame: () => {
            if (frame === null || animation === null || currentSpritesheet === null || currentImage === null) {
                return null;
            }

            if (width === 0 && currentImage.width > 0) {
                width = currentImage.width / currentSpritesheet.cols;
                height = currentImage.height / currentSpritesheet.rows;
                frame.width = width - (currentSpritesheet.padding * 2);
                frame.height = height - (currentSpritesheet.padding * 2);
            }

            if (width === 0) return null;

            if (performance.now() - time > properties.frameRate) {
                col++;

                if (col >= animation.startingCol + animation.frames) {
                    col = animation.startingCol;
                }

                frame.x = col * width + currentSpritesheet.padding;
                frame.y = row * height + currentSpritesheet.padding;

                time = performance.now();
            }

            return frame;
        }
    };
}
