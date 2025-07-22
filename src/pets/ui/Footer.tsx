import Button from "../../util/ui/Button";
import { COLORS } from "./Home";

const FOOTER_BUTTONS_SCALE = 1.4;
const FOOTER_BUTTONS_BORDER_RADIUS = 20;

interface FooterProps { }

const Footer: React.FC<FooterProps> = ({ }) => {
    return <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: `4px solid ${COLORS.primary}`,
        padding: '10px',
        backgroundColor: COLORS.surface,
        gap: '10px'
    }}>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Chat</Button>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Give Treat</Button>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Play</Button>
        <Button fontScale={FOOTER_BUTTONS_SCALE} borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>Pet</Button>
    </div>;
};

export default Footer;
