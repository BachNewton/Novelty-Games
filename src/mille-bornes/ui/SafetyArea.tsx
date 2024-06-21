import { AceCard, EmergencyCard, SafetyCard, SealantCard, TankerCard } from '../logic/Card';
import CardUi from "./Card";

interface SafetyAreaProps {
    safetyArea: Array<SafetyCard>;
}

const SafetyArea: React.FC<SafetyAreaProps> = ({ safetyArea }) => {
    const aceCard = safetyArea.find(card => card instanceof AceCard) || null;
    const emergencyCard = safetyArea.find(card => card instanceof EmergencyCard) || null;
    const sealantCard = safetyArea.find(card => card instanceof SealantCard) || null;
    const tankerCard = safetyArea.find(card => card instanceof TankerCard) || null;

    return <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0 }}>
        <CardUi card={aceCard} transform={getTransform(aceCard)} objectPosition='bottom' />
        <CardUi card={emergencyCard} transform={getTransform(emergencyCard)} objectPosition='bottom' />
        <CardUi card={sealantCard} transform={getTransform(sealantCard)} objectPosition='bottom' />
        <CardUi card={tankerCard} transform={getTransform(tankerCard)} objectPosition='bottom' />
    </div>;
}

function getTransform(safetyCard: SafetyCard | null): string | undefined {
    return safetyCard && safetyCard.coupFourré ? `rotate(90deg) scale(${182 / 254})` : undefined;
}

export default SafetyArea;
