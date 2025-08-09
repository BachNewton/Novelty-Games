interface WidgetProps {
    children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ children }) => {
    return <div style={{
        border: '1px solid var(--novelty-blue)',
        borderRadius: '15px',
        padding: '10px',
        margin: '7.5px',
        boxShadow: 'black 0px 0px 10px'
    }}>
        {children}
    </div>;
};

export default Widget;
