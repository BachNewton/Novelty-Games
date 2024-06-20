import { AceCard, EmergencyCard, SafetyCard, SealantCard, TankerCard } from '../logic/Card';
import CardUi from "./Card";

interface SafetyAreaProps {
    safetyArea: Array<SafetyCard>;
}

const SafetyArea: React.FC<SafetyAreaProps> = ({ safetyArea }) => {
    return <div style={{ display: 'grid', gridAutoFlow: 'column', minHeight: 0 }}>
        <CardUi card={safetyArea.find(card => card instanceof AceCard) || null} />
        <CardUi card={safetyArea.find(card => card instanceof EmergencyCard) || null} />
        <CardUi card={safetyArea.find(card => card instanceof SealantCard) || null} />
        <CardUi card={safetyArea.find(card => card instanceof TankerCard) || null} />
    </div>;
}

export default SafetyArea;
