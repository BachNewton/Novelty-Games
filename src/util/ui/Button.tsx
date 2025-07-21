interface ButtonProps {
    onClick?: () => void;
    fontScale?: number;
    borderRadius?: number;
    isEnabled?: boolean;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick = () => { }, fontScale = 1, borderRadius = 10, isEnabled = true, children }) => {
    return <button
        onClick={onClick}
        disabled={!isEnabled}
        style={{ fontSize: `${fontScale}em`, borderRadius: `${borderRadius}px`, cursor: 'pointer', flexGrow: 1 }}
    >
        {children}
    </button>;
};

export default Button;
