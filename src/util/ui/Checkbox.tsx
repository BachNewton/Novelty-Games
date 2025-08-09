import './css/checkbox.css';

interface CheckboxProps {
    text: string;
    checked: boolean;
    onClick: () => void;
    onOnlyClick?: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ text, checked, onClick, onOnlyClick }) => {
    const onlyButton = onOnlyClick === undefined
        ? <></>
        : <button type="button" className="only-button" onClick={onOnlyClick}>only</button>;

    return <label className="container">
        {text}
        <input type="checkbox" checked={checked} onChange={onClick} />
        <span className="checkmark"></span>
        {onlyButton}
    </label>;
};

export default Checkbox;
