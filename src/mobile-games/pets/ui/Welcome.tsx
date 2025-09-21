import VerticalSpacer from "../../../util/ui/Spacer";
import { COLORS } from "./Home";


const Welcome: React.FC = () => {
    const accent = (text: string) => <span style={{ fontWeight: 'bold', color: COLORS.secondary }}>{text}</span>;
    const accent2 = (text: string) => <span style={{ fontWeight: 'bold', color: COLORS.primary }}>{text}</span>;

    return <div>
        <div style={{
            fontSize: '1.5em',
            fontWeight: 'bold',
            textAlign: 'center',
            background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.secondary} 50%, ${COLORS.primary} 100%)`,
            padding: '5px',
            borderRadius: '10px'
        }}>Welcome Pets!</div>

        <VerticalSpacer height={30} />

        <div>This is a surprise video game gift for my animal loving spouse, {accent2('Elliott')}!</div>

        <VerticalSpacer height={15} />

        <div>This is a game about {accent('discovering')}, {accent('interacting')} with, and {accent('befriending')} pets!</div>

        <VerticalSpacer height={15} />

        <div style={{ fontWeight: 'bold' }}>How to play</div>
        <ul style={{ margin: '2px' }}>
            <li>Travel to {accent('real locations')} to discover the hidden pets</li>
            <li>Interact with pets to increase their {accent('friendship')}</li>
            <li>Come back to the game often because pets like to take {accent('naps')}</li>
            <li>{accent('Explore')} each and every thing a pet has to say</li>
            <li>And, of course, {accent('fall in love')} with the unique personality of every pet</li>
        </ul>

        <VerticalSpacer height={15} />

        <div>Have fun, and {accent2('I love you')}!</div>
    </div>
};

export default Welcome;
