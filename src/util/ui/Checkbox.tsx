import './css/checkbox.css';

interface CheckboxProps {
    text: string;
    checked: boolean;
    onClick: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ text, checked, onClick }) => {
    return <label className="container">{text}
        <input type="checkbox" checked={checked} onChange={onClick} />
        <span className="checkmark"></span>
    </label>;
};

export default Checkbox;
