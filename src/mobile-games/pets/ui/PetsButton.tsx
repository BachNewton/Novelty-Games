import Button from "../../../util/ui/Button";

const FOOTER_BUTTONS_SCALE = 1.4;
const FOOTER_BUTTONS_BORDER_RADIUS = 20;

interface PetsButtonProps {
    text: string;
    onClick: () => void;
    columns?: number;
}

const PetsButton: React.FC<PetsButtonProps> = ({ text, onClick, columns = 1 }) => {
    return <div style={{ display: 'flex', gridColumn: `span ${columns}` }}><Button
        onClick={onClick}
        fontScale={FOOTER_BUTTONS_SCALE}
        borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}>
        {text}
    </Button></div>;
};

export default PetsButton;
