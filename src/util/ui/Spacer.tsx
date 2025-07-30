interface VerticalSpacerProps {
    height: string;
}

const VerticalSpacer: React.FC<VerticalSpacerProps> = ({ height }) => {
    return <div style={{ marginBottom: height }} />;
};

export default VerticalSpacer;
