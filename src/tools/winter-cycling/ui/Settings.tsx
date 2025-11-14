import { useState } from "react";
import { DistanceUnit, Save, ServerEnv, TemperatureUnit } from "../data/Save";
import VerticalSpacer from "../../../util/ui/Spacer";

interface SettingsProps {
    save: Save;
    onSaveChange: (save: Save) => void;
}

type Option = DistanceUnit | TemperatureUnit | ServerEnv;

const Settings: React.FC<SettingsProps> = ({ save, onSaveChange }) => {
    const [distanceUnit, setDistanceUnit] = useState(save.distanceUnit);
    const [temperatureUnit, setTemperatureUnit] = useState(save.temperatureUnit);
    const [serverEnv, setServerEnv] = useState(save.serverEnv ?? ServerEnv.DEVELOPMENT);

    const handleDistanceUnitClick = (u: DistanceUnit) => {
        setDistanceUnit(u);
        onSaveChange({ ...save, distanceUnit: u });
    };

    const handleTemperatureUnitClick = (u: TemperatureUnit) => {
        setTemperatureUnit(u);
        onSaveChange({ ...save, temperatureUnit: u });
    };

    const handleServerEnvClick = (env: ServerEnv) => {
        setServerEnv(env);
        onSaveChange({ ...save, serverEnv: env });
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
            <div style={getOptionStyle(DistanceUnit.KM, distanceUnit)} onClick={() => handleDistanceUnitClick(DistanceUnit.KM)}>Kilometers</div>
            <div style={getOptionStyle(DistanceUnit.MILE, distanceUnit)} onClick={() => handleDistanceUnitClick(DistanceUnit.MILE)}>Miles</div>
        </div>

        <VerticalSpacer height={10} />

        <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Temperature Units</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={getOptionStyle(TemperatureUnit.CELSIUS, temperatureUnit)} onClick={() => handleTemperatureUnitClick(TemperatureUnit.CELSIUS)}>Celsius</div>
            <div style={getOptionStyle(TemperatureUnit.FAHRENHEIT, temperatureUnit)} onClick={() => handleTemperatureUnitClick(TemperatureUnit.FAHRENHEIT)}>Fahrenheit</div>
        </div>

        {/* <VerticalSpacer height={10} />

        <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Server Environment</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={getOptionStyle(ServerEnv.DEVELOPMENT, serverEnv)} onClick={() => handleServerEnvClick(ServerEnv.DEVELOPMENT)}>Dev</div>
            <div style={getOptionStyle(ServerEnv.PRODUCTION, serverEnv)} onClick={() => handleServerEnvClick(ServerEnv.PRODUCTION)}>Prod</div>
        </div> */}
    </div>
};


function getOptionStyle(option: Option, selectedOption: Option): React.CSSProperties {
    const selected = option === selectedOption;

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
