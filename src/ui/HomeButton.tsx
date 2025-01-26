interface HomeButtonProps {
    onClick: () => void;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onClick }) => {
    const homeButtonStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        marginTop: '5px',
        marginLeft: '5px',
        fontSize: '1em'
    };

    return <button style={homeButtonStyle} onClick={onClick}>🏠</button>;
};

export default HomeButton;
