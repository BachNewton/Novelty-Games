interface ButtonProps {
    text: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
    return <div style={{
        border: '1px solid white',
        borderRadius: '15px',
        padding: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: 'rgba(0,0,0,0.3)',
        boxShadow: '0px 0px 15px black'
    }} onClick={onClick}>
        {text}
    </div>;
};

export default Button;
