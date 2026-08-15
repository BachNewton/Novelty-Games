import { COLORS } from "./Home";
import TextReveal from "./TextReveal";

interface SpeechBubbleProps {
    /** Typed out one character at a time. */
    text: string;
    /** Changing this restarts the typewriter reveal, even if the text is the same. */
    revealKey?: string | number;
    /** Positioning and styling overrides, merged over the bubble's defaults. */
    style?: React.CSSProperties;
    /** Custom content rendered above the text, for headers such as a name and friendship hearts. */
    children?: React.ReactNode;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, revealKey, style, children }) => {
    return <div style={{
        width: 'calc(100% - 15px)',
        minHeight: '2.5em',
        margin: '7.5px',
        border: `2px solid ${COLORS.primary}`,
        borderRadius: '25px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        boxSizing: 'border-box',
        fontFamily: 'Pet',
        fontSize: '1.2em',
        ...style
    }}>
        {children}

        <TextReveal key={revealKey}>{text}</TextReveal>
    </div>;
};

export default SpeechBubble;
