import { useState } from "react";
import VerticalSpacer from "../../../util/ui/Spacer";
import { FlameEffect } from "./FlameEffect";
import { Rider } from "../data/Save";

interface SubmissionProps { }

const Submission: React.FC<SubmissionProps> = ({ }) => {
    const [selectedRider, setSelectedRider] = useState<Rider>(Rider.KYLE);
    const [distance, setDistance] = useState(5);
    const [temperature, setTemperature] = useState(10);

    return <div style={{
        fontSize: '1.5em',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '15px',
        boxSizing: 'border-box'
    }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>🚲 Winter Cylcing ❄️</div>

        <div style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px'
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Rider</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={getRiderStyle(Rider.KYLE, selectedRider)} onClick={() => setSelectedRider(Rider.KYLE)}>Kyle</div>
                <div style={getRiderStyle(Rider.NICK, selectedRider)} onClick={() => setSelectedRider(Rider.NICK)}>Nick</div>
                <div style={getRiderStyle(Rider.LANDON, selectedRider)} onClick={() => setSelectedRider(Rider.LANDON)}>Landon</div>
            </div>

            <VerticalSpacer height={10} />

            <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Distance</div>

            <div>
                <input
                    type="number"
                    style={{ fontSize: '1em', textAlign: 'center', width: '5ch' }}
                    value={distance}
                    onChange={e => setDistance(Number(e.target.value))}
                    onFocus={e => e.target.select()}
                />

                <span> km</span>
            </div>

            <VerticalSpacer height={10} />

            <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Tempeture</div>

            <div>
                <input
                    type="number"
                    style={{ fontSize: '1em', textAlign: 'center', width: '5ch' }}
                    value={temperature}
                    onChange={e => setTemperature(Number(e.target.value))}
                    onFocus={e => e.target.select()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                />

                <span>° C</span>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '25px' }}>
            <FlameEffect color="var(--novelty-blue)" intensity={5}>
                <div style={{ border: '1px solid white', backgroundColor: 'blue' }}>thing</div>
            </FlameEffect>

            <div>X</div>

            <FlameEffect color="var(--novelty-orange)" intensity={5}>
                <div style={{ border: '1px solid white', backgroundColor: 'blue' }}>thing2</div>
            </FlameEffect>
        </div>

        <VerticalSpacer height={25} />

        <button style={{ fontSize: '1.25em', borderRadius: '25px', padding: '10px', width: '80%' }}>Submit</button>
    </div>;
};

function getRiderStyle(rider: Rider, selectedRider: Rider): React.CSSProperties {
    const selected = rider === selectedRider;

    return {
        border: '1px solid white',
        borderRadius: '15px',
        padding: '10px',
        cursor: 'pointer',
        textAlign: 'center',
        transform: selected ? 'scale(1.2)' : undefined,
        backgroundColor: selected ? 'var(--novelty-blue)' : undefined,
        transition: 'transform 0.1s ease-in-out'
    };
}

export default Submission;
