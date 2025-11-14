import { useEffect, useState } from "react";
import { Ride } from "../data/Ride";
import { DistanceUnit, Rider, Save, TemperatureUnit } from "../data/Save";
import { calculateScore } from "../logic/ScoreCalculator";
import { riderDisplayName } from "../logic/Converter";
import Tabs from "./Tabs";
import { MONTHS } from "../data/Months";

interface LeaderboardsProps {
    rides: Ride[] | null;
    save: Save;
    onSaveChange: (save: Save) => void;
}

interface Tally {
    rider: Rider;
    score: number;
}

const Leaderboards: React.FC<LeaderboardsProps> = ({ rides, save, onSaveChange }) => {
    const [finalTally, setFinalTally] = useState<Tally[] | null>(null);
    const [monthIndex, setMonthIndex] = useState<number | null>(save.monthIndex ?? null);

    useEffect(() => {
        const tally: Tally[] = [
            { rider: Rider.KYLE, score: 0 },
            { rider: Rider.NICK, score: 0 },
            { rider: Rider.LANDON, score: 0 }
        ];

        const filteredRides = monthIndex !== null ? rides?.filter(ride => {
            const rideDate = new Date(ride.date);
            const rideMonth = rideDate.getMonth();
            return rideMonth === (monthIndex + 10) % 12; // November is 10
        }) : rides;

        for (const ride of filteredRides ?? []) {
            const rideScore = calculateScore(ride.distance, ride.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS);

            const tallyEntry = tally.find(tallyEntry => tallyEntry.rider === ride.rider)!;

            tallyEntry.score += rideScore;
        }

        tally.sort((a, b) => b.score - a.score);

        setFinalTally(tally);
    }, [rides, monthIndex]);

    const onMonthSelected = (monthIndex: number | null) => {
        setMonthIndex(monthIndex);
        onSaveChange({ ...save, monthIndex });
    };

    const tallyUi = finalTally?.map((tallyEntry, index) => {
        const name = riderDisplayName(tallyEntry.rider);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        const fontScale = index === 0 ? 3 : index === 1 ? 2.5 : 1.5;
        const medalColor = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32";


        return <div key={index} style={{
            border: `3px solid ${medalColor}`,
            borderRadius: '25px',
            padding: '15px',
            boxShadow: `0px 0px 15px ${medalColor}`
        }}>
            <div style={{ fontSize: `${fontScale}em`, fontWeight: 'bold' }}>
                {medal} {name} {medal}
            </div>
            <div style={{ textAlign: 'center' }}>Score: {tallyEntry.score.toLocaleString()}</div>
        </div>;
    });

    return <div style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column'
    }}>
        <Tabs tabs={['All Winter']} selectedTabIndex={monthIndex === null ? 0 : null} onTabSelected={_ => onMonthSelected(null)} fontScale={1.25} />
        <Tabs tabs={MONTHS} selectedTabIndex={monthIndex} onTabSelected={onMonthSelected} fontScale={1} />

        <div style={{
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '50px'
        }}>
            {tallyUi}
        </div>
    </div>;
};

export default Leaderboards;
