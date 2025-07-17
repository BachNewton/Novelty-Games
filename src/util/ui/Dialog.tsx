interface DialogProps {
    isOpen?: boolean;
    children?: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen = true, children }) => {
    if (!isOpen) return <></>;

    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: 'grey',
        padding: '15px',
        margin: '15px',
        borderRadius: '15px',
        border: '2px solid white'
    };

    return <div style={overlayStyle}>
        <div style={containerStyle}>
            {children}
        </div>
    </div>;
};

export default Dialog;
