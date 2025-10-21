import { useEffect, useState } from "react";

interface TallyProps {
    number: number | null;
}

const Tally: React.FC<TallyProps> = ({ number }) => {
    const [displayedNumber, setDisplayedNumber] = useState<number | null>(null);

    useEffect(() => {
        if (number === null) {
            setDisplayedNumber(null);
            return;
        }

        const start = 0;
        const end = Number(number);

        // ensure immediate zero while animating
        setDisplayedNumber(start);

        let rafId = 0;
        const duration = Math.max(120, Math.min(800, Math.abs(end - start) * 12));
        const startTime = performance.now();

        const step = (now: number) => {
            const t = Math.min(1, (now - startTime) / duration);
            const value = Math.round(start + (end - start) * t);
            setDisplayedNumber(value);

            if (t < 1) {
                rafId = requestAnimationFrame(step);
            } else {
                setDisplayedNumber(end);
            }
        };

        rafId = requestAnimationFrame(step);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [number]);

    return <span>{number === null ? "???" : displayedNumber?.toLocaleString()}</span>;
};

export default Tally;
