interface ButtonProps {
    onClick: () => void;
    fontSize?: number;
    borderRadius?: number;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, fontSize = 1, borderRadius = 10, children }) => {
    return <button onClick={onClick} style={{ fontSize: `${fontSize}em`, borderRadius: `${borderRadius}px` }}>
        {children}
    </button>;
};

export default Button;
