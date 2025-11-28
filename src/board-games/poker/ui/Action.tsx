interface ActionProps {
    isEnabled: boolean;
    children: string;
    onClick: () => void;
}

const Action: React.FC<ActionProps> = ({ isEnabled, children, onClick }) => {
    return <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isEnabled ? 'black' : 'transparent'}`,
        borderRadius: '15px',
        padding: '10px',
        boxShadow: isEnabled ? '0px 0px 5px black' : undefined,
        color: isEnabled ? undefined : 'grey',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        cursor: isEnabled ? 'pointer' : undefined
    }} onClick={() => {
        if (isEnabled) {
            onClick();
        }
    }}>{children}</div>;
};

export default Action;
