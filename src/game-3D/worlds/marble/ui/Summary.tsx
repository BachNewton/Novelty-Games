interface SummaryProps {
    levelName: String;
    yourTime: number;
    bronzeTime: number;
    silverTime: number;
    goldTime: number;
    diamondTime: number;
}

const Summary: React.FC<SummaryProps> = ({ levelName, yourTime, bronzeTime, silverTime, goldTime, diamondTime }) => {
    const achievedBronze = yourTime <= bronzeTime;
    const achievedSilver = yourTime <= silverTime;
    const achievedGold = yourTime <= goldTime;
    const achievedDiamond = yourTime <= diamondTime;
    const iconOfBestAchievement = getIconOfBestAchievement(achievedBronze, achievedSilver, achievedGold, achievedDiamond);

    return <div style={{ fontSize: '2em', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '50px', padding: '15px' }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', fontSize: '1.5em' }}>
            {levelName}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Time: {yourTime.toFixed(1)} seconds
        </div>
        <br />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', justifyItems: 'end' }}>
            <div>
                Bronze 🥉
            </div>
            <div>
                {bronzeTime} seconds {getAchievedIcon(achievedBronze)}
            </div>
            <div>
                Silver 🥈
            </div>
            <div>
                {silverTime} seconds {getAchievedIcon(achievedSilver)}
            </div>
            <div>
                Gold 🥇
            </div>
            <div>
                {goldTime} seconds {getAchievedIcon(achievedGold)}
            </div>
            <div>
                Diamond 💎
            </div>
            <div>
                {diamondTime} seconds {getAchievedIcon(achievedDiamond)}
            </div>
        </div>
        <br />
        <div style={{ textAlign: 'center', fontSize: '4em' }}>
            🏁{iconOfBestAchievement}🏁
        </div>
    </div>;
};

function getAchievedIcon(achieved: boolean): string {
    return achieved ? '✅' : '❌';
}

function getIconOfBestAchievement(achievedBronze: boolean, achievedSilver: boolean, achievedGold: boolean, achievedDiamond: boolean): string {
    if (achievedDiamond) return '💎';
    if (achievedGold) return '🥇';
    if (achievedSilver) return '🥈';
    if (achievedBronze) return '🥉';
    return '😔';
}

export function createSummary(props: SummaryProps): JSX.Element {
    return <Summary {...props} />;
}

export function clearSummary(): JSX.Element {
    return <></>;
}
