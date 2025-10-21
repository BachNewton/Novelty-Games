interface VerticalSpacerProps {
    height: number;
}

const VerticalSpacer: React.FC<VerticalSpacerProps> = ({ height }) => {
    return <div style={{ marginBottom: `${height}px` }} />;
};

export default VerticalSpacer;
