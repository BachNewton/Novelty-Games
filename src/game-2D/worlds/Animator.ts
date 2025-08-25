export interface Animator<Animations extends AnimatorAnimations> {
    play: (animationName: keyof Animations) => void;
    getFrame: () => AnimationFrame | null;
}

type AnimatorAnimations = Record<string, AnimationProperties>;

export interface AnimationFrame {
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
    debug: boolean;
}

interface AnimationProperties {
    startingRow: number;
    startingCol: number;
    frames: number;
}

interface AnimatorProperties<Animations extends AnimatorAnimations> {
    imageSrc: string;
    rows: number;
    cols: number;
    animations: Animations;
    frameRate: number;
    padding: number;
}

export function createAnimator<Animations extends AnimatorAnimations>(
    properties: AnimatorProperties<Animations>,
    debug: boolean = false
): Animator<Animations> {
    const image = new Image();
    image.src = properties.imageSrc;

    const width = image.width / properties.cols;
    const height = image.height / properties.rows;

    let animation: AnimationProperties | null = null;
    let time = -1;
    let frame: AnimationFrame | null = null;
    let col = -1;
    let row = -1;

    return {
        play: (animationName) => {
            animation = properties.animations[animationName];
            time = performance.now();

            col = animation.startingCol;
            row = animation.startingRow;

            frame = {
                image: image,
                x: col * width + properties.padding,
                y: row * height + properties.padding,
                width: width - (properties.padding * 2),
                height: height - (properties.padding * 2),
                debug: debug
            };
        },

        getFrame: () => {
            if (frame === null || animation === null) return null;

            if (performance.now() - time > properties.frameRate) {
                col++;

                if (col >= animation.frames) {
                    col = animation.startingCol;
                }

                frame.x = col * width + properties.padding;

                time = performance.now();
            }

            return frame;
        }
    };
}
