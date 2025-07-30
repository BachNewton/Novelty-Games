import Button from "../../../util/ui/Button";

const FOOTER_BUTTONS_SCALE = 1.4;
const FOOTER_BUTTONS_BORDER_RADIUS = 20;

interface PetsButtonProps {
    text: string;
    onClick: () => void;
    isEnabled: boolean;
    interactionSeen: boolean;
    columns?: number;
}

const PetsButton: React.FC<PetsButtonProps> = ({ text, onClick, isEnabled, interactionSeen, columns = 1 }) => {
    const color = interactionSeen ? 'grey' : undefined;

    return <div style={{ display: 'flex', gridColumn: `span ${columns}` }}>
        <Button
            isEnabled={isEnabled}
            color={color}
            onClick={onClick}
            fontScale={FOOTER_BUTTONS_SCALE}
            borderRadius={FOOTER_BUTTONS_BORDER_RADIUS}
        >
            {text}
        </Button>
    </div>;
};

export default PetsButton;
