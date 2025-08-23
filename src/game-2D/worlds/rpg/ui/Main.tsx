import Button from "../../../../util/ui/Button";
import VerticalSpacer from "../../../../util/ui/Spacer";

interface MainProps { }

const Main: React.FC<MainProps> = ({ }) => {
    return <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%'
    }}>
        <div style={{
            border: '2px white solid',
            borderRadius: '15px',
            height: '75%',
            margin: '10px',
            padding: '10px',
            pointerEvents: 'auto'
        }}>
            <div>Edit Pannel</div>
            <VerticalSpacer height={15} />
            <Button onClick={() => console.log('Button clicked')}>Button</Button>
        </div>
    </div>;
};

export function getOverlay(): JSX.Element {
    return <Main />;
}
