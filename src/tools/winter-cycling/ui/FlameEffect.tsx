import React, { useState, useRef, useEffect, useMemo } from 'react';
import '../css/FlameEffect.css';

interface FlameEffectProps {
    color?: string;
    intensity?: number;
    children: React.ReactNode;
}

export const FlameEffect: React.FC<FlameEffectProps> = ({
    color = '#ff8c00',
    intensity = 60,
    children,
}) => {
    // 1. State to store the width of the content
    const [contentWidth, setContentWidth] = useState<number>(0);

    // 2. A ref to attach to the content wrapper div
    const contentRef = useRef<HTMLDivElement>(null);

    // 3. Effect to measure the content's width after it renders
    useEffect(() => {
        if (contentRef.current) {
            // Set the state to the measured width of the content element
            setContentWidth(contentRef.current.offsetWidth);
        }
        // Rerun this effect if the children change, as the width might change too
    }, [children]);

    const particles = useMemo(() => {
        return Array.from({ length: intensity }).map((_, index) => {
            const style = {
                '--flame-color': color,
                left: `${Math.random() * 100}%`,
                animationDuration: `${1 + Math.random()}s`,
                animationDelay: `${Math.random()}s`,
                transform: `scale(${0.5 + Math.random()})`,
            } as React.CSSProperties;
            return <div key={index} className="flame-particle" style={style} />;
        });
    }, [color, intensity]);

    return (
        <div className="flame-wrapper">
            {/* 4. Apply the dynamic width to the flame container */}
            <div
                className="flame-container"
                // We add a little extra width (e.g., 40px) to make it wider than the content
                style={{ width: contentWidth > 0 ? `${contentWidth + 40}px` : '100px' }}
            >
                {particles}
            </div>

            {/* 5. Attach the ref to the content wrapper for measurement */}
            <div className="content-on-top" ref={contentRef}>
                {children}
            </div>
        </div>
    );
};
