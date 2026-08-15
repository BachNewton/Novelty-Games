import { COLORS } from "./Home";
import TextReveal from "./TextReveal";

interface SpeechBubbleProps {
    text: string;
    /** Optional small caption shown above the text, e.g. a whispering indicator. */
    label?: string;
    /** Renders the text in italics, for voices that aren't quite here yet. */
    isItalic?: boolean;
    /** Changing this restarts the typewriter reveal, even if the text is the same. */
    revealKey?: string | number;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, label, isItalic = false, revealKey }) => {
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
        fontStyle: isItalic ? 'italic' : 'normal'
    }}>
        {labelUi(label)}

        <TextReveal key={revealKey}>
            {text}
        </TextReveal>
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
