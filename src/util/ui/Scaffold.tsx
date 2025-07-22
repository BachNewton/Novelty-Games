interface ScaffoldProps {
    header: JSX.Element;
    footer: JSX.Element;
    fontScale?: number;
    children?: React.ReactNode;
}

const Scaffold: React.FC<ScaffoldProps> = ({ header, footer, fontScale = 1, children }) => {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        fontSize: `${fontScale}em`
    }}>
        <div>{header}</div>
        <div style={{ flexGrow: 1, overflow: 'auto' }}>{children}</div>
        <div>{footer}</div>
    </div>;
};

export default Scaffold;
