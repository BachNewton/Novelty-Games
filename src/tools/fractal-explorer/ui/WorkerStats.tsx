import { WorkerStats as WorkerStatsData } from '../logic/WorkerPool';
import { WORKER_COLORS } from '../data/ColorPalettes';

interface WorkerStatsProps {
    workerStats: WorkerStatsData[];
    tilesCompleted: number;
    totalTiles: number;
    workerCount: number;
}

export const WorkerStats: React.FC<WorkerStatsProps> = ({
    workerStats,
    tilesCompleted,
    totalTiles,
    workerCount
}) => {
    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        minWidth: '180px',
        pointerEvents: 'none'
    };

    const headerStyle: React.CSSProperties = {
        fontWeight: 'bold',
        marginBottom: '8px',
        fontSize: '14px',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        paddingBottom: '6px'
    };

    const statRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px'
    };

    const workerBarContainerStyle: React.CSSProperties = {
        marginTop: '10px'
    };

    const workerRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '4px'
    };

    const workerLabelStyle = (workerId: number): React.CSSProperties => ({
        width: '24px',
        height: '16px',
        backgroundColor: WORKER_COLORS[workerId % WORKER_COLORS.length],
        borderRadius: '3px',
        marginRight: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'bold'
    });

    const barContainerStyle: React.CSSProperties = {
        flex: 1,
        height: '12px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '6px',
        overflow: 'hidden'
    };

    const barStyle = (workerId: number, percentage: number): React.CSSProperties => ({
        height: '100%',
        width: `${percentage}%`,
        backgroundColor: WORKER_COLORS[workerId % WORKER_COLORS.length],
        transition: 'width 0.2s ease-out'
    });

    const countStyle: React.CSSProperties = {
        marginLeft: '8px',
        width: '30px',
        textAlign: 'right'
    };

    // Calculate max tiles for relative bar scaling
    const maxTiles = Math.max(...workerStats.map(s => s.tilesCompleted), 1);

    const progress = totalTiles > 0 ? Math.round((tilesCompleted / totalTiles) * 100) : 0;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>Worker Statistics</div>

            <div style={statRowStyle}>
                <span>Workers:</span>
                <span>{workerCount}</span>
            </div>

            <div style={statRowStyle}>
                <span>Progress:</span>
                <span>{tilesCompleted}/{totalTiles} ({progress}%)</span>
            </div>

            <div style={workerBarContainerStyle}>
                {workerStats.map((stats) => (
                    <div key={stats.id} style={workerRowStyle}>
                        <div style={workerLabelStyle(stats.id)}>
                            {stats.id}
                        </div>
                        <div style={barContainerStyle}>
                            <div style={barStyle(stats.id, (stats.tilesCompleted / maxTiles) * 100)} />
                        </div>
                        <span style={countStyle}>{stats.tilesCompleted}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
