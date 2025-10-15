import { useState } from "react";
import { DistanceUnit, Save, TemperatureUnit } from "../data/Save";
import VerticalSpacer from "../../../util/ui/Spacer";

interface SettingsProps {
    save: Save;
    onSaveChange: (save: Save) => void;
}

const Settings: React.FC<SettingsProps> = ({ save, onSaveChange }) => {
    const [distanceUnit, setDistanceUnit] = useState(save.distanceUnit);
    const [temperatureUnit, setTemperatureUnit] = useState(save.temperatureUnit);

    const handleDistanceUnitClick = (u: DistanceUnit) => {
        setDistanceUnit(u);
        onSaveChange({ ...save, distanceUnit: u });
    };

    const handleTemperatureUnitClick = (u: TemperatureUnit) => {
        setTemperatureUnit(u);
        onSaveChange({ ...save, temperatureUnit: u });
    };

    return <div style={{
        fontSize: '1.5em',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '15px',
        gap: '5px',
        boxSizing: 'border-box'
    }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Distance Units</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={getUnitStyle(DistanceUnit.KM, distanceUnit)} onClick={() => handleDistanceUnitClick(DistanceUnit.KM)}>Kilometers</div>
            <div style={getUnitStyle(DistanceUnit.MILE, distanceUnit)} onClick={() => handleDistanceUnitClick(DistanceUnit.MILE)}>Miles</div>
        </div>

        <VerticalSpacer height={10} />

        <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Temperature Units</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={getUnitStyle(TemperatureUnit.CELSIUS, temperatureUnit)} onClick={() => handleTemperatureUnitClick(TemperatureUnit.CELSIUS)}>Celsius</div>
            <div style={getUnitStyle(TemperatureUnit.FAHRENHEIT, temperatureUnit)} onClick={() => handleTemperatureUnitClick(TemperatureUnit.FAHRENHEIT)}>Fahrenheit</div>
        </div>
    </div>
};


function getUnitStyle(unit: DistanceUnit | TemperatureUnit, selectedUnit: DistanceUnit | TemperatureUnit): React.CSSProperties {
    const selected = unit === selectedUnit;

    return {
        border: '1px solid white',
        borderRadius: '15px',
        padding: '10px',
        cursor: 'pointer',
        textAlign: 'center',
        transform: selected ? 'scale(1.2)' : undefined,
        backgroundColor: selected ? 'var(--novelty-blue)' : undefined,
        transition: 'transform 0.1s ease-in-out'
    };
}

export default Settings;
