interface Animator {
    setAnimation: (animation: Animation) => void;
    draw: (x: number, y: number, width: number, height: number) => void;
    update: (deltaTime: number) => void;
    setDebug: (debug: boolean) => void;
}

export interface Animation {
    startingWindowX: number;
    startingWindowY: number;
    totalWindowsX: number;
    totalWindowsY: number;
}

export function createAnimator(
    ctx: CanvasRenderingContext2D,
    spriteSheet: HTMLImageElement,
    frameWidth: number,
    frameHeight: number,
    framesPerSecond: number
): Animator {
    let animation: Animation | null = null;
    let debug = false;

    let startX = -1;
    let startY = -1;
    let lastFrameTime = -1;

    const resetStartX = (animation: Animation) => startX = animation.startingWindowX * frameWidth;
    const resetStartY = (animation: Animation) => startY = animation.startingWindowY * frameHeight;

    const updateWindow = (deltaTime: number) => {
        if (animation === null) return;

        lastFrameTime += deltaTime;

        if (lastFrameTime <= 1000 / framesPerSecond) return;

        lastFrameTime = 0;

        startX += frameWidth;

        const endX = frameWidth * (animation.totalWindowsX + animation.startingWindowX);
        const endY = frameHeight * (animation.totalWindowsY + animation.startingWindowY);

        if (startX >= endX) {
            resetStartX(animation);
            startY += frameHeight;

            if (startY >= endY) {
                resetStartY(animation);
            }
        }
    };

    return {
        setAnimation: (newAnimation: Animation) => {
            animation = newAnimation;
            resetStartX(animation);
            resetStartY(animation);
            lastFrameTime = 0;
        },
        draw: (x: number, y: number, width: number, height: number) => {
            if (animation === null) return;

            if (debug) {
                drawDebug(width, frameWidth, height, frameHeight, spriteSheet, startX, startY, ctx, x, y, animation);
            }

            ctx.drawImage(spriteSheet, startX, startY, frameWidth, frameHeight, x, y, width, height);
        },
        update: (deltaTime: number) => updateWindow(deltaTime),
        setDebug: (newDebug: boolean) => debug = newDebug
    };
}


function drawDebug(
    width: number,
    frameWidth: number,
    height: number,
    frameHeight: number,
    spriteSheet: HTMLImageElement,
    startX: number,
    startY: number,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animation: Animation
) {
    const scaleX = width / frameWidth;
    const scaleY = height / frameHeight;
    const scaledWidth = spriteSheet.width * scaleX;
    const scaledHeight = spriteSheet.height * scaleY;
    const xOffset = startX * scaleX;
    const yOffset = startY * scaleY;

    // Draw the entire sprite sheet
    ctx.drawImage(spriteSheet, x - xOffset, y - yOffset, scaledWidth, scaledHeight);

    ctx.strokeStyle = 'magenta';
    // Draw a border around the sprite
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);

    ctx.strokeStyle = 'yellow';
    const scaledFrameWidth = frameWidth * scaleX;
    const scaledFrameHeight = frameHeight * scaleY;
    // Draw a border around the current animation window
    ctx.strokeRect(
        (x - xOffset - 2) + (scaledFrameWidth * animation.startingWindowX),
        (y - yOffset - 2) + (scaledFrameHeight * animation.startingWindowY),
        width * animation.totalWindowsX + 4,
        height * animation.totalWindowsY + 4
    );
}
