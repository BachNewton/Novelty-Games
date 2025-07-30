import { useEffect, useState } from "react";
import { COLORS } from "./Home";

const MAX_HEARTS = 5;
const BORDER_RADIUS = '20px';

interface FriendshipBarProps {
    isDiscovered: boolean;
    level: number;
    // A unique key (like an ID) to trigger a full animation reset.
    animationKey: string | number;
}

const FriendshipBar: React.FC<FriendshipBarProps> = ({ isDiscovered, level, animationKey }) => {
    const [barWidth, setBarWidth] = useState('0%');

    // This effect runs whenever the animationKey or level changes.
    useEffect(() => {
        // Instantly reset the bar to 0% width.
        setBarWidth('0%');

        // After a very short delay, set the bar to its true target width.
        // This forces the CSS transition to play from 0% every time.
        const timer = setTimeout(() => {
            const targetWidth = (level / MAX_HEARTS) * 100;
            setBarWidth(`${targetWidth}%`);
        }, 50); // Delay allows React to process the 0% state first.

        return () => clearTimeout(timer); // Cleanup on re-render.
    }, [animationKey]); // The effect's dependency array.

    if (!isDiscovered) return <></>;

    // A helper to generate a row of hearts.
    const heartRow = (symbol: '🩷' | '🤍') => (
        <div style={{ display: 'flex', width: '100%' }}>
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <div key={i} style={{ flexGrow: 1, textAlign: 'center', padding: '2px' }}>
                    {symbol}
                </div>
            ))}
        </div>
    );

    return <div style={{
        position: 'absolute',
        top: '15px',
        width: '80%',
        border: `2px solid ${COLORS.primary}`,
        borderRadius: BORDER_RADIUS,
        backgroundColor: COLORS.surface,
        overflow: 'hidden',
        // position: 'relative' // Needed for child absolute positioning.
    }}>
        {/* Layer 1: The background with empty hearts */}
        {heartRow('🤍')}

        {/* Layer 2: The foreground that grows in width */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: barWidth, // The width is now a state variable
            backgroundColor: COLORS.secondary,
            overflow: 'hidden',
            transition: 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
            whiteSpace: 'nowrap'
        }}>
            {heartRow('🩷')}
        </div>
    </div>;
};

export default FriendshipBar;
