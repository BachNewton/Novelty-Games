import { COLORS } from "./Home";
import TextReveal from "./TextReveal";

interface SpeechBubbleProps {
    text: string;
    /** Optional small caption shown above the text, e.g. a whispering indicator. */
    label?: string;
    /** Renders the text in italics, for voices that aren't quite here yet. */
    isItalic?: boolean;
    /** Types the text out one character at a time. Best kept off for long text the player taps to read. */
    reveal?: boolean;
    /** Changing this restarts the typewriter reveal, even if the text is the same. */
    revealKey?: string | number;
    /** Positioning and styling overrides, merged over the bubble's defaults. */
    style?: React.CSSProperties;
    /** Custom content rendered above the text, for headers the label caption can't express. */
    children?: React.ReactNode;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, label, isItalic = false, reveal = true, revealKey, style, children }) => {
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
        fontStyle: isItalic ? 'italic' : 'normal',
        ...style
    }}>
        {labelUi(label)}

        {children}

        {reveal ? <TextReveal key={revealKey}>{text}</TextReveal> : <div>{text}</div>}
    </div>;
};

function labelUi(label: string | undefined): JSX.Element {
    if (label === undefined) return <></>;

    return <div style={{
        fontSize: '0.65em',
        fontStyle: 'italic',
        color: COLORS.secondary,
        opacity: 0.9,
        marginBottom: '4px'
    }}>
        {label}
    </div>;
}

export default SpeechBubble;
