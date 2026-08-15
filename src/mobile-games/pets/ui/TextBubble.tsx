import { COLORS } from "./Home";
import TextReveal from "./TextReveal";

interface TextBubbleProps {
    text: string;
    /** Types the text out one character at a time. Best kept off for long text the player taps to read. */
    reveal?: boolean;
    italic?: boolean;
    fontScale?: number;
    /** Positioning and sizing is left to whoever renders the bubble. */
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const TextBubble: React.FC<TextBubbleProps> = ({ text, reveal = true, italic = false, fontScale = 1.2, style, children }) => {
    return <div style={{
        minHeight: '2.5em',
        border: `2px solid ${COLORS.primary}`,
        borderRadius: '25px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        boxSizing: 'border-box',
        fontFamily: 'Pet',
        fontSize: `${fontScale}em`,
        fontStyle: italic ? 'italic' : undefined,
        ...style
    }}>
        {children}

        {reveal ? <TextReveal>{text}</TextReveal> : <div>{text}</div>}
    </div>;
};

export default TextBubble;
