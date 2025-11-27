import React, { ReactElement, ReactNode } from 'react';

// --- Types ---

// The props for the individual item configuration
interface CircleItemProps {
    center?: ReactNode; // The content closest to the center
    middle?: ReactNode; // The content in the middle ring
    outer?: ReactNode;  // The content on the outer edge
}

// The props for the main layout wrapper
interface CircleLayoutProps {
    children: ReactElement<CircleItemProps> | ReactElement<CircleItemProps>[];
    radii: {
        center: number;
        middle: number;
        outer: number;
    };
    startAngle?: number; // Default -90 (Top)
    className?: string;
    style?: React.CSSProperties;
}

// --- Components ---

/**
 * This component doesn't render anything DOM-wise on its own.
 * It is used to structure the data for the parent CircleLayout.
 */
export const CircleItem: React.FC<CircleItemProps> = () => null;

/**
 * The Layout Engine
 */
export const CircleLayout: React.FC<CircleLayoutProps> = ({
    children,
    radii,
    startAngle = -90,
    className,
    style,
}) => {
    const items = React.Children.toArray(children) as ReactElement<CircleItemProps>[];
    const count = items.length;
    const angleStep = 360 / count;

    // Helper to calculate position based on radius and angle
    const getPosition = (r: number, angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = r * Math.cos(angleRad);
        const y = r * Math.sin(angleRad);
        return { x, y };
    };

    // The max radius determines the container size
    const maxRadius = Math.max(radii.center, radii.middle, radii.outer);
    const containerSize = maxRadius * 2;

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                width: `${containerSize}px`,
                height: `${containerSize}px`,
                margin: '0 auto',
                ...style,
            }}
        >
            {items.map((item, index) => {
                const angle = startAngle + index * angleStep;

                // Extract the content from the child props
                const { center, middle, outer } = item.props;

                return (
                    <React.Fragment key={index}>
                        {/* Render Center Content */}
                        {center && (
                            <PositionedElement
                                x={getPosition(radii.center, angle).x}
                                y={getPosition(radii.center, angle).y}
                            >
                                {center}
                            </PositionedElement>
                        )}

                        {/* Render Middle Content */}
                        {middle && (
                            <PositionedElement
                                x={getPosition(radii.middle, angle).x}
                                y={getPosition(radii.middle, angle).y}
                            >
                                {middle}
                            </PositionedElement>
                        )}

                        {/* Render Outer Content */}
                        {outer && (
                            <PositionedElement
                                x={getPosition(radii.outer, angle).x}
                                y={getPosition(radii.outer, angle).y}
                            >
                                {outer}
                            </PositionedElement>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// Internal helper to reduce inline style repetition
const PositionedElement: React.FC<{ x: number; y: number; children: ReactNode }> = ({ x, y, children }) => (
    <div
        style={{
            position: 'absolute',
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        {children}
    </div>
);

export default CircleLayout;
