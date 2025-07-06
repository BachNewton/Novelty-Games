interface ScaffoldProps {
    header: JSX.Element;
    content: JSX.Element;
    footer: JSX.Element;
    fontScale?: number;
}

const Scaffold: React.FC<ScaffoldProps> = ({ header, content, footer, fontScale = 1 }) => {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontSize: `${fontScale}em`
    }}>
        <div>{header}</div>
        <div style={{ flexGrow: 1, overflow: 'auto' }}>{content}</div>
        <div>{footer}</div>
    </div>;
};

export default Scaffold;
