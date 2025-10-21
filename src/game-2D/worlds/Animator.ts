export interface Animator<Animations extends Record<string, any>> {
    play: (animationName: keyof Animations) => void;
    getFrame: () => AnimationFrame | null;
}

export interface AnimationFrame {
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
    debug: boolean;
}

interface SpritesheetProperties {
    src: string;
    rows: number;
    cols: number;
    padding: number;
}

interface AnimationProperties<SpritesheetKey extends string> {
    imageKey: SpritesheetKey;
    startingRow: number;
    startingCol: number;
    frames: number;
}

export function createAnimator<
    Spritesheets extends Record<string, SpritesheetProperties>,
    Animations extends Record<string, AnimationProperties<keyof Spritesheets & string>>
>(
    properties: {
        spritesheets: Spritesheets;
        animations: Animations;
        frameRate: number;
    },
    debug: boolean = false
): Animator<Animations> {
    const images: Record<string, HTMLImageElement> = {};

    for (const key in properties.spritesheets) {
        const image = new Image();
        image.src = properties.spritesheets[key].src;
        images[key] = image;
    }

    let animation: AnimationProperties<keyof Spritesheets & string> | null = null;
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
            currentSpritesheet = properties.spritesheets[animation.imageKey];
            currentImage = images[animation.imageKey];

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
            if (frame === null || animation === null || currentSpritesheet === null || currentImage === null || width === 0) {
                return null;
            }

            if (currentImage.width > 0) {
                width = currentImage.width / currentSpritesheet.cols;
                height = currentImage.height / currentSpritesheet.rows;
                frame.width = width - (currentSpritesheet.padding * 2);
                frame.height = height - (currentSpritesheet.padding * 2);
            }

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
