interface HorizontalLineProps {
    thickness: string;
    color: string;
}

const HorizontalLine: React.FC<HorizontalLineProps> = ({ thickness, color }) => {
    return <div style={{ borderTop: `${thickness} solid ${color}` }} />;
};

export default HorizontalLine;
