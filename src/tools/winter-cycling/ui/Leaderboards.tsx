import { useEffect, useState } from "react";
import { Ride } from "../data/Ride";
import { DistanceUnit, Rider, Save, TemperatureUnit } from "../data/Save";
import { calculateScore } from "../logic/ScoreCalculator";
import { riderDisplayName, toFahrenheit, toMiles } from "../logic/Converter";
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
    highestScoringRide: Ride | null;
    coldestRide: Ride | null;
    longestRide: Ride | null;
}

const Leaderboards: React.FC<LeaderboardsProps> = ({ rides, save, onSaveChange }) => {
    const [finalTally, setFinalTally] = useState<Tally[] | null>(null);
    const [monthIndex, setMonthIndex] = useState<number | null>(save.monthIndex ?? null);
    const [leaderboardIndex, setLeaderboardIndex] = useState<number | null>(save.leaderboardIndex ?? null);

    useEffect(() => {
        const tally: Tally[] = [
            { rider: Rider.KYLE, score: 0, highestScoringRide: null, coldestRide: null, longestRide: null },
            { rider: Rider.NICK, score: 0, highestScoringRide: null, coldestRide: null, longestRide: null },
            { rider: Rider.LANDON, score: 0, highestScoringRide: null, coldestRide: null, longestRide: null }
        ];

        const filteredRides = monthIndex !== null ? rides?.filter(ride => {
            const rideDate = new Date(ride.date);
            const rideMonth = rideDate.getMonth();
            return rideMonth === (monthIndex + 10) % 12; // November is 10
        }) : rides;

        for (const ride of filteredRides ?? []) {
            const rideScore = calculateScore(ride.distance, ride.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS);

            const tallyEntry = tally.find(tallyEntry => tallyEntry.rider === ride.rider)!;

            const currentHighestScoringRide = tallyEntry.highestScoringRide !== null
                ? calculateScore(tallyEntry.highestScoringRide.distance, tallyEntry.highestScoringRide.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS)
                : -1;

            const currentColdestRideTemp = tallyEntry.coldestRide !== null
                ? tallyEntry.coldestRide.temperature
                : Infinity;

            const currentLongestRideDistance = tallyEntry.longestRide !== null
                ? tallyEntry.longestRide.distance
                : -1;

            if (rideScore > currentHighestScoringRide) {
                tallyEntry.highestScoringRide = ride;
            }

            if (ride.temperature < currentColdestRideTemp) {
                tallyEntry.coldestRide = ride;
            }

            if (ride.distance > currentLongestRideDistance) {
                tallyEntry.longestRide = ride;
            }

            tallyEntry.score += rideScore;
        }

        tally.sort(getSortingFunction(leaderboardIndex));

        setFinalTally(tally);
    }, [rides, monthIndex, leaderboardIndex]);

    const onMonthSelected = (monthIndex: number | null) => {
        setMonthIndex(monthIndex);
        onSaveChange({ ...save, monthIndex });
    };

    const onLeaderboardSelected = (leaderboardIndex: number | null) => {
        setLeaderboardIndex(leaderboardIndex);
        onSaveChange({ ...save, leaderboardIndex });
    };

    const tallyUi = finalTally?.map((tallyEntry, index) => {
        const name = riderDisplayName(tallyEntry.rider);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        const fontScale = index === 0 ? 3 : index === 1 ? 2.5 : 1.5;
        const medalColor = index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32";

        const subtitleUi = getSubtitleUi(leaderboardIndex, tallyEntry, save);

        return <div key={index} style={{
            border: `3px solid ${medalColor}`,
            borderRadius: '25px',
            padding: '15px',
            boxShadow: `0px 0px 15px ${medalColor}`
        }}>
            <div style={{ fontSize: `${fontScale}em`, fontWeight: 'bold' }}>
                {medal} {name} {medal}
            </div>

            <div style={{ textAlign: 'center' }}>{subtitleUi}</div>
        </div>;
    });

    return <div style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column'
    }}>
        <Tabs tabs={['All Winter']} selectedTabIndex={monthIndex === null ? 0 : null} onTabSelected={_ => onMonthSelected(null)} fontScale={1.25} />
        <Tabs tabs={MONTHS} selectedTabIndex={monthIndex} onTabSelected={onMonthSelected} fontScale={1} />
        <Tabs tabs={['Total Score']} selectedTabIndex={leaderboardIndex === null ? 0 : null} onTabSelected={_ => onLeaderboardSelected(null)} fontScale={1.25} useAltColor={true} />
        <Tabs tabs={['Score', 'Distance', 'Temperature']} selectedTabIndex={leaderboardIndex} onTabSelected={onLeaderboardSelected} fontScale={1} useAltColor={true} />

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

function getSortingFunction(leaderboardIndex: number | null): (a: Tally, b: Tally) => number {
    switch (leaderboardIndex) {
        case 0: // Highest Score
            return (a, b) => {
                const aHighestScore = a.highestScoringRide ? calculateScore(a.highestScoringRide.distance, a.highestScoringRide.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS) : 0;
                const bHighestScore = b.highestScoringRide ? calculateScore(b.highestScoringRide.distance, b.highestScoringRide.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS) : 0;
                return bHighestScore - aHighestScore;
            };
        case 1: // Longest Distance
            return (a, b) => {
                const aDistance = a.longestRide ? a.longestRide.distance : 0;
                const bDistance = b.longestRide ? b.longestRide.distance : 0;
                return bDistance - aDistance;
            }
        case 2: // Coldest Temperature
            return (a, b) => {
                const aTemp = a.coldestRide ? a.coldestRide.temperature : Infinity;
                const bTemp = b.coldestRide ? b.coldestRide.temperature : Infinity;
                return aTemp - bTemp; // Colder is better
            }
        default: // Total Score
            return (a, b) => b.score - a.score;
    }
}

function getSubtitleUi(leaderboardIndex: number | null, tallyEntry: Tally, save: Save): string {
    const noRides = 'No rides';

    if (leaderboardIndex === 0) { // Highest Score
        const ride = tallyEntry.highestScoringRide;

        if (!ride) return noRides;

        const rideScore = calculateScore(ride.distance, ride.temperature, DistanceUnit.KM, TemperatureUnit.CELSIUS);

        return `Highest Score: ${rideScore.toLocaleString()}`;
    } else if (leaderboardIndex === 1) { // Longest Distance
        const ride = tallyEntry.longestRide;

        if (!ride) return noRides;

        const distance = save.distanceUnit === DistanceUnit.MILE ? toMiles(ride.distance) : ride.distance;
        const unit = save.distanceUnit === DistanceUnit.MILE ? 'miles' : 'km';

        return `Longest Ride: ${distance.toFixed(1)} ${unit}`;
    } else if (leaderboardIndex === 2) { // Coldest Temperature
        const ride = tallyEntry.coldestRide;

        if (!ride) return noRides;

        const temperature = save.temperatureUnit === TemperatureUnit.FAHRENHEIT ? toFahrenheit(ride.temperature) : ride.temperature;
        const unit = save.temperatureUnit === TemperatureUnit.FAHRENHEIT ? '°F' : '°C';

        return `Coldest Ride: ${temperature.toFixed(1)} ${unit}`;
    } else { // Total Score
        return `Score: ${tallyEntry.score.toLocaleString()}`;
    }
}

export default Leaderboards;
