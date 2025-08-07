import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS } from "./Home";
import { LOW_FRIENDSHIP_THRESHOLD } from "../logic/DataManager";

const MAX_HEARTS = LOW_FRIENDSHIP_THRESHOLD;
const BORDER_RADIUS = '20px';
const ANIMATION_DELAY_MS = 200;
const ANIMATION_SPEED = '1.5s';
const PADDING = '3px';
const WIDTH = '80%';

interface FriendshipBarProps {
    isDiscovered: boolean;
    level: number;
    animationKey: number;
}

const FriendshipBar: React.FC<FriendshipBarProps> = ({ isDiscovered, level, animationKey }) => {
    const [barWidth, setBarWidth] = useState('0%');
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const previousLevel = useRef(level);
    const previousAnimationKey = useRef(animationKey);

    useEffect(() => {
        const isNewAnimation = previousAnimationKey.current !== animationKey;

        if (isNewAnimation) {
            setShouldAnimate(false);
            setBarWidth('0%');

            const timer = setTimeout(() => {
                setShouldAnimate(true);
                setBarWidth(calculateTargetWidth(level));
            }, ANIMATION_DELAY_MS);

            previousAnimationKey.current = animationKey;
            previousLevel.current = level;

            return () => clearTimeout(timer);
        } else {
            setShouldAnimate(true);
            setBarWidth(calculateTargetWidth(level));

            previousLevel.current = level;
        }
    }, [animationKey, level]);

    const heartStyle: React.CSSProperties = {
        flexGrow: 1,
        textAlign: 'center',
        padding: PADDING
    };

    const hearts = useMemo(() => {
        return Array.from({ length: MAX_HEARTS }).map((_, index) => {
            const heart = index < level ? '🩷' : '🤍';
            return <div key={index} style={heartStyle}>{heart}</div>;
        });
    }, [level]);

    if (!isDiscovered) return <></>;

    return <div style={{
        position: 'absolute',
        top: '15px',
        width: WIDTH,
        border: `2px solid ${COLORS.primary}`,
        borderRadius: BORDER_RADIUS,
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
        boxShadow: level < MAX_HEARTS ? undefined : glowEffect()
    }}>
        {backgroundColor(shouldAnimate, barWidth, level)}

        <div style={{ display: 'flex', position: 'absolute', top: '0px', width: '100%' }}>
            {hearts}
        </div>
    </div>;
};

function glowEffect(): string {
    return `
        0 0 10px rgba(255, 215, 0, 0.6),
        0 0 17px rgba(255, 215, 0, 0.5),
        0 0 24px rgba(255, 215, 0, 0.4),
        0 0 31px rgba(255, 215, 0, 0.3)
    `;
}

function backgroundColor(shouldAnimate: boolean, barWidth: string, level: number): JSX.Element {
    if (level === 0) return <div style={{ padding: PADDING }}>{'\u200B'}</div>;

    return <div style={{
        width: `calc(${barWidth} - ${PADDING} - ${PADDING})`,
        background: `linear-gradient(to right, white 0%, ${COLORS.secondary} 50%, ${COLORS.primary} 100%)`,
        borderRadius: BORDER_RADIUS,
        padding: PADDING,
        transition: shouldAnimate ? `width ${ANIMATION_SPEED} cubic-bezier(0.25, 1, 0.5, 1)` : 'none'
    }}>{'\u200B'}</div>;
}

function calculateTargetWidth(level: number): string {
    const width = Math.min((level / MAX_HEARTS) * 100, 100);

    return `${width}%`;
}

export default FriendshipBar;
