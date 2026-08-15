import { COLORS } from "./Home";
import TextReveal from "./TextReveal";

interface SpeechBubbleProps {
    /** Typed out one character at a time. A bubble can also hold only custom content instead. */
    text?: string;
    /** Changing this restarts the typewriter reveal, even if the text is the same. */
    revealKey?: string | number;
    /** Positioning and styling overrides, merged over the bubble's defaults. */
    style?: React.CSSProperties;
    /** Custom content rendered above the text, for headers such as a name and friendship hearts. */
    children?: React.ReactNode;
    /** Custom content rendered below the text, for actions such as a button. */
    footer?: React.ReactNode;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, revealKey, style, children, footer }) => {
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

        {text === undefined ? null : <TextReveal key={revealKey}>{text}</TextReveal>}

        {footer}
    </div>;
};

export default SpeechBubble;
