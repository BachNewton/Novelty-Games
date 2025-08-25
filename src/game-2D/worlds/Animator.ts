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
    let time: number = -1;
    let frame: AnimationFrame | null = null;

    return {
        play: (animationName) => {
            animation = properties.animations[animationName];
            time = performance.now();

            frame = {
                image: image,
                x: animation.startingCol * width,
                y: animation.startingCol * height,
                width: width,
                height: height,
                debug: debug
            };
        },

        getFrame: () => {
            if (performance.now() - time > properties.frameRate) {
                //
            }

            return frame;
        }
    };
}
