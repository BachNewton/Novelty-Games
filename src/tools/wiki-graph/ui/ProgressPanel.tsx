import { useState } from 'react';
import { UI_CONFIG } from '../config/uiConfig';
import { API_CONFIG } from '../config/apiConfig';

interface ProgressPanelProps {
    articleCount: number;
    linkCount: number;
    fetchingCount: number;
    pendingQueueSize: number;
    linkLimit: number;
    maxDepth: number;
    selectedArticle: string | null;
    selectedCategory: string | null;
    onLinkLimitChange: (limit: number) => void;
    onMaxDepthChange: (depth: number) => void;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({
    articleCount,
    linkCount,
    fetchingCount,
    pendingQueueSize,
    linkLimit,
    maxDepth,
    selectedArticle,
    selectedCategory,
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
                    top: UI_CONFIG.panel.positionOffset,
                    right: UI_CONFIG.panel.positionOffset,
                    backgroundColor: UI_CONFIG.panel.background,
                    color: 'white',
                    border: 'none',
                    borderRadius: UI_CONFIG.panel.borderRadius,
                    padding: UI_CONFIG.panel.minimizedPadding,
                    cursor: 'pointer',
                    fontSize: UI_CONFIG.panel.fontSize,
                    zIndex: UI_CONFIG.panel.zIndex
                }}
            >
                Wiki Graph [{articleCount}]
            </button>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            top: UI_CONFIG.panel.positionOffset,
            right: UI_CONFIG.panel.positionOffset,
            backgroundColor: UI_CONFIG.panel.background,
            color: 'white',
            padding: UI_CONFIG.panel.padding,
            borderRadius: UI_CONFIG.panel.borderRadius,
            minWidth: UI_CONFIG.panel.minWidth,
            fontFamily: 'monospace',
            fontSize: UI_CONFIG.panel.fontSize,
            zIndex: UI_CONFIG.panel.zIndex
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
                <span style={{ color: UI_CONFIG.panel.accent }}>Articles:</span> {articleCount}
            </div>
            <div style={{ marginBottom: '8px' }}>
                <span style={{ color: UI_CONFIG.panel.accent }}>Links:</span> {linkCount}
            </div>
            {fetchingCount > 0 && (
                <div style={{ marginBottom: '8px', color: UI_CONFIG.panel.accent }}>
                    Fetching {fetchingCount} article{fetchingCount !== 1 ? 's' : ''}...
                </div>
            )}
            <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#888' }}>Pending:</span> {pendingQueueSize}
            </div>

            <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                    Links per node: {linkLimit}
                </label>
                <input
                    type="range"
                    min={API_CONFIG.crawling.linkLimit.min}
                    max={API_CONFIG.crawling.linkLimit.max}
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
                    min={API_CONFIG.crawling.maxDepth.min}
                    max={API_CONFIG.crawling.maxDepth.max}
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
                        <div style={{ fontSize: '12px', color: UI_CONFIG.panel.category, marginTop: '4px' }}>
                            {selectedCategory}
                        </div>
                    )}
                </div>
            )}

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
