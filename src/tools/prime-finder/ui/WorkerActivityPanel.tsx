import { WorkerStateInfo } from '../data/MessageTypes';

interface WorkerActivityPanelProps {
    workerStates: WorkerStateInfo[];
}

const WorkerActivityPanel: React.FC<WorkerActivityPanelProps> = ({ workerStates }) => {
    const containerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        fontFamily: 'monospace'
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '1.1em',
        fontWeight: 'bold',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        paddingBottom: '8px'
    };

    const workersGridStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px'
    };

    return (
        <div style={containerStyle}>
            <div style={titleStyle}>Worker Activity ({workerStates.length} threads)</div>
            <div style={workersGridStyle}>
                {workerStates.map(worker => (
                    <WorkerCard key={worker.workerId} worker={worker} />
                ))}
            </div>
        </div>
    );
};

interface WorkerCardProps {
    worker: WorkerStateInfo;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker }) => {
    const cardStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        padding: '10px',
        minWidth: '140px',
        border: worker.status === 'working'
            ? '1px solid rgba(76, 175, 80, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.2)'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    };

    const workerIdStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '0.9em'
    };

    const statusStyle: React.CSSProperties = {
        fontSize: '0.75em',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: worker.status === 'working'
            ? 'rgba(76, 175, 80, 0.3)'
            : 'rgba(158, 158, 158, 0.3)',
        color: worker.status === 'working' ? '#81c784' : '#bdbdbd'
    };

    const rangeStyle: React.CSSProperties = {
        fontSize: '0.8em',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: '6px'
    };

    const throughputStyle: React.CSSProperties = {
        fontSize: '0.85em',
        color: '#4fc3f7',
        marginBottom: '8px'
    };

    const progressBarContainerStyle: React.CSSProperties = {
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
    };

    const progressBarStyle: React.CSSProperties = {
        height: '100%',
        width: `${worker.progress * 100}%`,
        backgroundColor: '#4fc3f7',
        borderRadius: '2px',
        transition: 'width 0.1s ease-out'
    };

    const formatNumber = (n: number): string => {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return n.toString();
    };

    const formatRange = (): string => {
        if (worker.status === 'idle') return 'Idle';
        return `${formatNumber(worker.currentBatchStart)}-${formatNumber(worker.currentBatchEnd)}`;
    };

    return (
        <div style={cardStyle}>
            <div style={headerStyle}>
                <span style={workerIdStyle}>W-{worker.workerId}</span>
                <span style={statusStyle}>
                    {worker.status === 'working' ? 'Working' : 'Idle'}
                </span>
            </div>
            <div style={rangeStyle}>{formatRange()}</div>
            <div style={throughputStyle}>
                {formatNumber(worker.numbersPerSecond)}/s
            </div>
            <div style={progressBarContainerStyle}>
                <div style={progressBarStyle} />
            </div>
        </div>
    );
};

export default WorkerActivityPanel;
