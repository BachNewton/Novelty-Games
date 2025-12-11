import { PrimeStatistics } from '../data/MessageTypes';

interface StatisticsPanelProps {
    statistics: PrimeStatistics;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ statistics }) => {
    const containerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        fontFamily: 'monospace',
        minWidth: '200px'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        paddingBottom: '8px'
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '0.95em'
    };

    const labelStyle: React.CSSProperties = {
        color: 'rgba(255, 255, 255, 0.7)'
    };

    const valueStyle: React.CSSProperties = {
        color: '#4fc3f7',
        fontWeight: 'bold'
    };

    const formatNumber = (n: number): string => {
        if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return n.toLocaleString();
    };

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const pad = (n: number) => n.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
        }
        return `${pad(minutes)}:${pad(seconds % 60)}`;
    };

    const density = statistics.totalNumbersChecked > 0
        ? ((statistics.totalPrimesFound / statistics.totalNumbersChecked) * 100).toFixed(2)
        : '0.00';

    return (
        <div style={containerStyle}>
            <div style={titleStyle}>Statistics</div>

            <div style={rowStyle}>
                <span style={labelStyle}>Primes Found</span>
                <span style={valueStyle}>{formatNumber(statistics.totalPrimesFound)}</span>
            </div>

            <div style={rowStyle}>
                <span style={labelStyle}>Largest Prime</span>
                <span style={valueStyle}>{formatNumber(statistics.largestPrime)}</span>
            </div>

            <div style={rowStyle}>
                <span style={labelStyle}>Rate</span>
                <span style={valueStyle}>{formatNumber(statistics.primesPerSecond)}/s</span>
            </div>

            <div style={rowStyle}>
                <span style={labelStyle}>Time</span>
                <span style={valueStyle}>{formatTime(statistics.elapsedTimeMs)}</span>
            </div>

            <div style={rowStyle}>
                <span style={labelStyle}>Checked</span>
                <span style={valueStyle}>{formatNumber(statistics.highestNumberChecked)}</span>
            </div>

            <div style={rowStyle}>
                <span style={labelStyle}>Density</span>
                <span style={valueStyle}>{density}%</span>
            </div>
        </div>
    );
};

export default StatisticsPanel;
