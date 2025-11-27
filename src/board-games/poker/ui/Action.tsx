interface ActionProps {
    isEnabled: boolean;
    children: string;
    onClick: () => void;
}

const Action: React.FC<ActionProps> = ({ isEnabled, children, onClick }) => {
    return <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid black',
        borderRadius: '15px',
        padding: '10px',
        boxShadow: '0px 0px 5px black'
    }}>{children}</div>;
};

export default Action;
