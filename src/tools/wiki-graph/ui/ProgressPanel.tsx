import { useState } from 'react';

interface ProgressPanelProps {
    articleCount: number;
    linkCount: number;
    fetchingCount: number;
    priorityQueueSize: number;
    pendingQueueSize: number;
    linkLimit: number;
    maxDepth: number;
    isRunning: boolean;
    selectedArticle: string | null;
    selectedCategory: string | null;
    onToggle: () => void;
    onLinkLimitChange: (limit: number) => void;
    onMaxDepthChange: (depth: number) => void;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({
    articleCount,
    linkCount,
    fetchingCount,
    priorityQueueSize,
    pendingQueueSize,
    linkLimit,
    maxDepth,
    isRunning,
    selectedArticle,
    selectedCategory,
    onToggle,
    onLinkLimitChange,
    onMaxDepthChange
}) => {
    const [minimized, setMinimized] = useState(false);

    if (minimized) {
        return (
            <button
                onClick={() => setMinimized(false)}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    zIndex: 100
                }}
            >
                Wiki Graph [{articleCount}]
            </button>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            minWidth: '200px',
            fontFamily: 'monospace',
            fontSize: '14px',
            zIndex: 100
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Wiki Graph</span>
                <button
                    onClick={() => setMinimized(true)}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '0 4px'
                    }}
                >
                    −
                </button>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#88D8B0' }}>Articles:</span> {articleCount}
            </div>
            <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#88D8B0' }}>Links:</span> {linkCount}
            </div>
            {fetchingCount > 0 && (
                <div style={{ marginBottom: '8px', color: '#88D8B0' }}>
                    Fetching {fetchingCount} article{fetchingCount !== 1 ? 's' : ''}...
                </div>
            )}
            <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#FF6B6B' }}>Priority:</span> {priorityQueueSize}
            </div>
            <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#888' }}>Pending:</span> {pendingQueueSize}
            </div>

            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Links per node: {linkLimit}
                </label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={linkLimit}
                    onChange={(e) => onLinkLimitChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Max depth: {maxDepth}
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={maxDepth}
                    onChange={(e) => onMaxDepthChange(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            {selectedArticle && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '12px',
                    marginBottom: '12px'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        Selected:
                    </div>
                    <div style={{ fontSize: '13px', wordBreak: 'break-word' }}>
                        {selectedArticle}
                    </div>
                    {selectedCategory && (
                        <div style={{ fontSize: '12px', color: '#4ECDC4', marginTop: '4px' }}>
                            {selectedCategory}
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={onToggle}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: isRunning ? '#FF6B6B' : '#4ECDC4',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}
            >
                {isRunning ? 'Pause' : 'Resume'}
            </button>

            <div style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.6)'
            }}>
                Click sphere to select & prioritize
            </div>
        </div>
    );
};

export default ProgressPanel;
