import './css/toggleSwitch.css';

interface ToggleSwitchProps {
    size?: 'small' | 'large'; // Optional size prop
    onChange?: (checked: boolean) => void; // Optional onChange callback
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ size = 'large', onChange }) => {
    const switchClass = size === 'small' ? 'switch-small' : 'switch';
    const sliderClass = size === 'small' ? 'slider-small' : 'slider';

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event.target.checked);
        }
    };

    return (
        <label className={switchClass}>
            <input type="checkbox" onChange={handleChange} />
            <span className={`${sliderClass} round`}></span>
        </label>
    );
};

export default ToggleSwitch;
