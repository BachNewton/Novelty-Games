import { useState } from "react";
import VerticalSpacer from "../../../util/ui/Spacer";
import { DistanceUnit, Rider, Save, TemperatureUnit } from "../data/Save";
import { SubmissionStatus } from "./Home";
import PixelFlame from "./PixelFlame";
import Tally from "./Tally";
import { calculateBase, calculateMultiplier, calculateScore, SCORE_FOR_MAX_INTENSITY } from "../logic/ScoreCalculator";

interface SubmissionProps {
    save: Save;
    onSaveChange: (save: Save) => void;
    onSubmit: (rider: Rider, distance: number, temperature: number) => void;
    submissionStatus: SubmissionStatus;
}

enum FlameType {
    DISTANCE,
    TEMPERATURE
}

const Submission: React.FC<SubmissionProps> = ({ save, onSaveChange, onSubmit, submissionStatus }) => {
    const [selectedRider, setSelectedRider] = useState(save.rider);
    const [distance, setDistance] = useState(String(save.distance));
    const [temperature, setTemperature] = useState(String(save.temperature));

    const score = calculateScore(Number(distance), Number(temperature), save.distanceUnit, save.temperatureUnit);
    const intensity = Math.min(score / SCORE_FOR_MAX_INTENSITY, 1);

    const handleSubmit = () => {
        const updated: Save = { ...save, rider: selectedRider, distance: Number(distance), temperature: Number(temperature) };

        onSaveChange(updated);
        onSubmit(updated.rider, updated.distance, updated.temperature);
    };

    const distanceAbbr = save.distanceUnit === DistanceUnit.KM ? 'km' : 'mi';
    const temperatureAbbr = save.temperatureUnit === TemperatureUnit.CELSIUS ? 'C' : 'F';

    const isSubmitDisabled = submissionStatus !== SubmissionStatus.IDLE;

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

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                {flameUi(FlameType.DISTANCE, distance, save.distanceUnit, save.temperatureUnit, intensity)}
                <div>X</div>
                {flameUi(FlameType.TEMPERATURE, temperature, save.distanceUnit, save.temperatureUnit, intensity)}
            </div>

            <div style={{ fontSize: '1.25em' }}>
                = <Tally number={calculateScore(Number(distance), Number(temperature), save.distanceUnit, save.temperatureUnit)} />
            </div>

            <VerticalSpacer height={10} />

            <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Distance</div>

            <div>
                <input
                    type="number"
                    style={{ fontSize: '1em', textAlign: 'center', width: '5ch' }}
                    value={distance}
                    onChange={e => setDistance(e.target.value)}
                    onFocus={e => e.target.select()}
                />

                <span> {distanceAbbr}</span>
            </div>

            <VerticalSpacer height={10} />

            <div style={{ fontWeight: 'bold', fontSize: '1.25em' }}>Temperature</div>

            <div>
                <input
                    type="number"
                    style={{ fontSize: '1em', textAlign: 'center', width: '5ch' }}
                    value={temperature}
                    onChange={e => setTemperature(e.target.value)}
                    onFocus={e => e.target.select()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                />

                <span>° {temperatureAbbr}</span>
            </div>


        </div>

        <button
            style={{ fontSize: '1.25em', borderRadius: '25px', padding: '10px', width: '80%' }}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
        >{getSubmitButtonText(submissionStatus)}</button>
    </div>;
};

function flameUi(flameType: FlameType, amount: string, distanceUnit: DistanceUnit, temperatureUnit: TemperatureUnit, intensity: number): JSX.Element {
    const color = flameType === FlameType.DISTANCE ? "#3498db" : "#ff8c00";

    const label = flameType === FlameType.DISTANCE
        ? calculateBase(Number(amount), distanceUnit).toFixed(0)
        : calculateMultiplier(Number(amount), temperatureUnit).toFixed(1);

    return <PixelFlame color={color} intensity={intensity}>
        <div style={{
            border: `1px solid ${color}`,
            color: color,
            backgroundColor: 'rgba(0,0,0,0.75)',
            padding: '7px',
            borderRadius: '15px',
            marginBottom: '2px',
            minWidth: '3ch',
            textAlign: 'center'
        }}>{label}</div>
    </PixelFlame>;
}

function getSubmitButtonText(submissionStatus: SubmissionStatus): React.ReactNode {
    switch (submissionStatus) {
        case SubmissionStatus.IDLE:
            return 'Submit 🥶';
        case SubmissionStatus.SUBMITTING:
            return 'Submitting... ⏳';
        case SubmissionStatus.SUCCESS:
            return 'Success! ✅';
    }
}

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
