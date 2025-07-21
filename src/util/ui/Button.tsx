interface ButtonProps {
    onClick?: () => void;
    fontScale?: number;
    borderRadius?: number;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick = () => { }, fontScale = 1, borderRadius = 10, children }) => {
    return <button onClick={onClick} style={{ fontSize: `${fontScale}em`, borderRadius: `${borderRadius}px`, cursor: 'pointer', flexGrow: 1 }}>
        {children}
    </button>;
};

export default Button;
