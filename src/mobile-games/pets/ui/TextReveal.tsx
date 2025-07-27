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

    return <div>{revealedText}</div>;
};

export default TextReveal;
