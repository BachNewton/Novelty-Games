import React, {
    ReactElement,
    ReactNode,
    useLayoutEffect,
    useRef,
    useState,
    useMemo,
} from 'react';

// --- Types ---

interface CircleItemProps {
    center?: ReactNode;
    middle?: ReactNode;
    outer?: ReactNode;
}

interface AutoCircleLayoutProps {
    children: ReactElement<CircleItemProps> | ReactElement<CircleItemProps>[];
    startAngle?: number;
    /** Gap between rings in pixels */
    ringGap?: number;
    /** Gap between items in the same ring (circumference) in pixels */
    itemGap?: number;
    className?: string;
    style?: React.CSSProperties;
}

// Data structure to hold measurements
type MeasuredSizes = {
    [key: string]: { width: number; height: number; radius: number };
};

// --- Components ---

export const CircleItem: React.FC<CircleItemProps> = () => null;

export const AutoCircleLayout: React.FC<AutoCircleLayoutProps> = ({
    children,
    startAngle = -90,
    ringGap = 20,
    itemGap = 10,
    className,
    style,
}) => {
    const items = React.Children.toArray(children) as ReactElement<CircleItemProps>[];
    const count = items.length;
    const angleStep = 360 / count;

    // Store refs to DOM elements to measure them
    const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Store the calculated dimensions
    const [sizes, setSizes] = useState<{
        center: { maxDim: number };
        middle: { maxDim: number };
        outer: { maxDim: number };
    }>({ center: { maxDim: 0 }, middle: { maxDim: 0 }, outer: { maxDim: 0 } });

    // 1. MEASUREMENT PHASE
    // We measure the DOM elements immediately after render but before paint
    useLayoutEffect(() => {
        let maxCenter = 0;
        let maxMiddle = 0;
        let maxOuter = 0;

        items.forEach((_, index) => {
            // Measure Center Content
            const c = itemRefs.current[`${index}-center`];
            if (c) maxCenter = Math.max(maxCenter, c.offsetWidth, c.offsetHeight);

            // Measure Middle Content
            const m = itemRefs.current[`${index}-middle`];
            if (m) maxMiddle = Math.max(maxMiddle, m.offsetWidth, m.offsetHeight);

            // Measure Outer Content
            const o = itemRefs.current[`${index}-outer`];
            if (o) maxOuter = Math.max(maxOuter, o.offsetWidth, o.offsetHeight);
        });

        setSizes({
            center: { maxDim: maxCenter },
            middle: { maxDim: maxMiddle },
            outer: { maxDim: maxOuter },
        });
    }, [children, count]); // Re-run if children change

    // 2. CALCULATION PHASE
    // Calculate the required radii based on the measured maximum sizes
    const calculatedRadii = useMemo(() => {
        // Helper: Minimum radius needed to fit N items of size W in a circle
        // Formula: r = (w + gap) / (2 * sin(PI / N))
        const getMinCircumferenceRadius = (itemSize: number) => {
            if (itemSize === 0) return 0;
            if (count === 1) return 0; // If only 1 item, it can be at center (0)
            const chord = itemSize + itemGap;
            return chord / (2 * Math.sin(Math.PI / count));
        };

        // -- Layer 1: Center --
        const r1_circ = getMinCircumferenceRadius(sizes.center.maxDim);
        // Base constraint: It must at least clear itself from absolute 0 if count > 1
        const r1 = Math.max(r1_circ, count > 1 ? sizes.center.maxDim / 2 : 0);

        // -- Layer 2: Middle --
        const r2_circ = getMinCircumferenceRadius(sizes.middle.maxDim);
        // Stack constraint: Previous Radius + Prev Half Size + Gap + My Half Size
        const r2_stack = r1 + (sizes.center.maxDim / 2) + ringGap + (sizes.middle.maxDim / 2);
        const r2 = sizes.middle.maxDim > 0 ? Math.max(r2_circ, r2_stack) : r1;

        // -- Layer 3: Outer --
        const r3_circ = getMinCircumferenceRadius(sizes.outer.maxDim);
        // Stack constraint: Middle Radius + Middle Half Size + Gap + My Half Size
        const r3_stack = r2 + (sizes.middle.maxDim / 2) + ringGap + (sizes.outer.maxDim / 2);
        const r3 = sizes.outer.maxDim > 0 ? Math.max(r3_circ, r3_stack) : r2;

        return { center: r1, middle: r2, outer: r3 };
    }, [sizes, count, ringGap, itemGap]);

    // Determine container size
    const maxRadius = Math.max(calculatedRadii.center, calculatedRadii.middle, calculatedRadii.outer);
    // Add half the size of the largest outer element to ensure it doesn't clip
    const totalContainerSize = (maxRadius + sizes.outer.maxDim / 2) * 2;

    // Helper for coordinates
    const getCoords = (r: number, deg: number) => {
        const rad = (deg * Math.PI) / 180;
        return {
            x: r * Math.cos(rad),
            y: r * Math.sin(rad),
        };
    };

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                // If measurements are 0 (first render), start small or hidden to avoid pop
                width: totalContainerSize || '100%',
                height: totalContainerSize || '100%',
                margin: '0 auto',
                // Optional: fade in once calculated
                opacity: sizes.center.maxDim ? 1 : 0,
                transition: 'width 0.3s, height 0.3s, opacity 0.2s',
                ...style,
            }}
        >
            {items.map((item, index) => {
                const angle = startAngle + index * angleStep;
                const { center, middle, outer } = item.props;

                return (
                    <React.Fragment key={index}>
                        <PositionedItem
                            content={center}
                            x={getCoords(calculatedRadii.center, angle).x}
                            y={getCoords(calculatedRadii.center, angle).y}
                            bindRef={(el) => (itemRefs.current[`${index}-center`] = el)}
                        />
                        <PositionedItem
                            content={middle}
                            x={getCoords(calculatedRadii.middle, angle).x}
                            y={getCoords(calculatedRadii.middle, angle).y}
                            bindRef={(el) => (itemRefs.current[`${index}-middle`] = el)}
                        />
                        <PositionedItem
                            content={outer}
                            x={getCoords(calculatedRadii.outer, angle).x}
                            y={getCoords(calculatedRadii.outer, angle).y}
                            bindRef={(el) => (itemRefs.current[`${index}-outer`] = el)}
                        />
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// Helper component to handle positioning and ref binding
const PositionedItem: React.FC<{
    content: ReactNode;
    x: number;
    y: number;
    bindRef: (el: HTMLDivElement | null) => void;
}> = ({ content, x, y, bindRef }) => {
    if (!content) return null;
    return (
        <div
            ref={bindRef}
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                // We use translate to move to the circle position, AND center the element itself
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                display: 'inline-flex', // Keep size to content
            }}
        >
            {content}
        </div>
    );
};
