interface ButtonProps {
    onClick: () => void;
    fontSize?: number;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, fontSize = 1, children }) => {
    return <button onClick={onClick} style={{ fontSize: `${fontSize}em` }}>
        {children}
    </button>;
};

export default Button;
