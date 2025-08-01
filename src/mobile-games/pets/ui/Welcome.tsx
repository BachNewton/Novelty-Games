import Button from "../../../util/ui/Button";
import Dialog from "../../../util/ui/Dialog";
import VerticalSpacer from "../../../util/ui/Spacer";
import { COLORS } from "./Home";

interface WelcomeProps {
    show: boolean;
    onClose: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ show, onClose }) => {
    const accent = (text: string) => <span style={{ fontWeight: 'bold', color: COLORS.secondary }}>{text}</span>;

    return <Dialog isOpen={show}>
        <div style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            textAlign: 'center',
            background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.secondary} 50%, ${COLORS.primary} 100%)`,
            padding: '5px',
            borderRadius: '10px'
        }}>Welcome Pets!</div>

        <VerticalSpacer height='30px' />

        <div>This is a surprise video game gift for my animal loving spouse, {accent('Elliott')}!</div>

        <VerticalSpacer height='15px' />

        <div>This is a game about {accent('discovering')}, {accent('interacting')} with, and {accent('befriending')} pets!</div>

        <VerticalSpacer height='15px' />

        <div style={{ fontWeight: 'bold' }}>How to play</div>
        <ul style={{ margin: '2px' }}>
            <li>Travel to {accent('real')} locations to discover the hidden pets</li>
            <li>Interact with pets to increase their {accent('friendship')}</li>
            <li>Come back to the game often because pets like to take {accent('naps')}</li>
            <li>{accent('Explore')} each and every thing a pet has to say</li>
            <li>And, of course, {accent('fall in love')} with the unique personality of every pet</li>
        </ul>

        <VerticalSpacer height='15px' />

        <div>Have fun, and I love you!</div>

        <VerticalSpacer height='30px' />

        <div style={{ display: 'flex' }}><Button onClick={onClose}>Close</Button></div>
    </Dialog>
};

export default Welcome;
