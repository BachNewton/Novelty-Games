import { useEffect, useState } from "react";

interface TextRevealProps {
    children: string;
}

const REVEAL_SPEED = 70;

const TextReveal: React.FC<TextRevealProps> = ({ children }) => {
    const [revealedText, setRevealedText] = useState('');

    useEffect(() => {
        let currentIndex = 0;

        const intervalId = setInterval(() => {
            setRevealedText(children.substring(0, currentIndex));

            currentIndex++;

            if (currentIndex > children.length) {
                clearInterval(intervalId);
            }
        }, REVEAL_SPEED);

        return () => clearInterval(intervalId);
    }, [children]);

    // The full text invisibly reserves the final size from the first frame, so the bubble doesn't
    // grow in height while the reveal types over it.
    return <div style={{ position: 'relative' }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>

        <div style={{ position: 'absolute', top: '0px', left: '0px' }}>{revealedText}</div>
    </div>;
};

export default TextReveal;
