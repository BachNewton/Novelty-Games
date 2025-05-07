import './css/toggleSwitch.css';

interface ToggleSwitchProps { }

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ }) => {
    return <label className="switch">
        <input type="checkbox" />
        <span className="slider round"></span>
    </label>;
};

export default ToggleSwitch;
