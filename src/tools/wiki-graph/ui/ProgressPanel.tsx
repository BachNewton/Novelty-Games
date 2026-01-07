import { useState } from 'react';
import { UI_CONFIG } from '../config/uiConfig';
import { API_CONFIG } from '../config/apiConfig';
import { PHYSICS_CONTROLS } from '../config/physicsConfig';

interface ProgressPanelProps {
    articleCount: number;
    nodeCount: number;
    leafCount: number;
    linkCount: number;
    fetchingCount: number;
    pendingQueueSize: number;
    linkLimit: number;
    maxDepth: number;
    selectedArticle: string | null;
    selectedCategory: string | null;
    onLinkLimitChange: (limit: number) => void;
    onMaxDepthChange: (depth: number) => void;
    springStrength: number;
    springLength: number;
    repulsionStrength: number;
    centeringStrength: number;
    damping: number;
    maxVelocity: number;
    nodeLimit: number;
    forceUnstable: boolean;
    onForceUnstableChange: (value: boolean) => void;
    onSpringStrengthChange: (value: number) => void;
    onSpringLengthChange: (value: number) => void;
    onRepulsionStrengthChange: (value: number) => void;
    onCenteringStrengthChange: (value: number) => void;
    onDampingChange: (value: number) => void;
    onMaxVelocityChange: (value: number) => void;
    onNodeLimitChange: (value: number) => void;
    useMockData: boolean;
    onMockDataToggle: (enabled: boolean) => void;
    mockDelay: number;
    onMockDelayChange: (value: number) => void;
}

const descriptionStyle = {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '2px',
    marginBottom: '8px'
};

const ProgressPanel: React.FC<ProgressPanelProps> = ({
    articleCount,
    nodeCount,
    leafCount,
    linkCount,
    fetchingCount,
    pendingQueueSize,
    linkLimit,
    maxDepth,
    selectedArticle,
    selectedCategory,
    onLinkLimitChange,
    onMaxDepthChange,
    springStrength,
    springLength,
    repulsionStrength,
    centeringStrength,
    damping,
    maxVelocity,
    nodeLimit,
    forceUnstable,
    onForceUnstableChange,
    onSpringStrengthChange,
    onSpringLengthChange,
    onRepulsionStrengthChange,
    onCenteringStrengthChange,
    onDampingChange,
    onMaxVelocityChange,
    onNodeLimitChange,
    useMockData,
    onMockDataToggle,
    mockDelay,
    onMockDelayChange
}) => {
    const [minimized, setMinimized] = useState(false);
    const [networkExpanded, setNetworkExpanded] = useState(false);
    const [physicsExpanded, setPhysicsExpanded] = useState(false);

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
            zIndex: UI_CONFIG.panel.zIndex,
            maxHeight: '90vh',
            overflowY: 'auto'
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
                <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>
                    ({nodeCount} nodes, {leafCount} leaves)
                </span>
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

            {/* Network Debug Section */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: '12px',
                marginBottom: '12px'
            }}>
                <div
                    onClick={() => setNetworkExpanded(!networkExpanded)}
                    style={{
                        fontWeight: 'bold',
                        marginBottom: networkExpanded ? '8px' : '0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none'
                    }}
                >
                    <span style={{ marginRight: '6px' }}>{networkExpanded ? '▼' : '▶'}</span>
                    Network
                </div>
                {networkExpanded && (
                    <>
                        <div style={{ marginBottom: useMockData ? '8px' : '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={useMockData}
                                    onChange={(e) => onMockDataToggle(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                Use mock data
                            </label>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                {useMockData ? 'Using generated fake data' : 'Using Wikipedia API'}
                            </div>
                        </div>
                        {useMockData && (
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px' }}>
                                    Fake delay: {mockDelay}ms
                                </label>
                                <input
                                    type="range"
                                    min={API_CONFIG.mock.delay.min}
                                    max={API_CONFIG.mock.delay.max}
                                    step={API_CONFIG.mock.delay.step}
                                    value={mockDelay}
                                    onChange={(e) => onMockDelayChange(parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Physics Controls Section */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: '12px',
                marginBottom: '12px'
            }}>
                <div
                    onClick={() => setPhysicsExpanded(!physicsExpanded)}
                    style={{
                        fontWeight: 'bold',
                        marginBottom: physicsExpanded ? '8px' : '0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        userSelect: 'none'
                    }}
                >
                    <span style={{ marginRight: '6px' }}>{physicsExpanded ? '▼' : '▶'}</span>
                    Physics
                </div>

                {physicsExpanded && (
                    <>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={forceUnstable}
                                    onChange={(e) => onForceUnstableChange(e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                Keep simulating
                            </label>
                            <div style={descriptionStyle}>Override stability check, never stop simulating</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Spring strength: {springStrength.toFixed(3)}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.springStrength.min}
                                max={PHYSICS_CONTROLS.springStrength.max}
                                step={PHYSICS_CONTROLS.springStrength.step}
                                value={springStrength}
                                onChange={(e) => onSpringStrengthChange(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.springStrength.description}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Spring length: {springLength}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.springLength.min}
                                max={PHYSICS_CONTROLS.springLength.max}
                                step={PHYSICS_CONTROLS.springLength.step}
                                value={springLength}
                                onChange={(e) => onSpringLengthChange(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.springLength.description}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Repulsion strength: {repulsionStrength}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.repulsionStrength.min}
                                max={PHYSICS_CONTROLS.repulsionStrength.max}
                                step={PHYSICS_CONTROLS.repulsionStrength.step}
                                value={repulsionStrength}
                                onChange={(e) => onRepulsionStrengthChange(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.repulsionStrength.description}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Centering strength: {centeringStrength.toFixed(4)}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.centeringStrength.min}
                                max={PHYSICS_CONTROLS.centeringStrength.max}
                                step={PHYSICS_CONTROLS.centeringStrength.step}
                                value={centeringStrength}
                                onChange={(e) => onCenteringStrengthChange(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.centeringStrength.description}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Damping: {damping.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.damping.min}
                                max={PHYSICS_CONTROLS.damping.max}
                                step={PHYSICS_CONTROLS.damping.step}
                                value={damping}
                                onChange={(e) => onDampingChange(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.damping.description}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Max velocity: {maxVelocity.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.maxVelocity.min}
                                max={PHYSICS_CONTROLS.maxVelocity.max}
                                step={PHYSICS_CONTROLS.maxVelocity.step}
                                value={maxVelocity}
                                onChange={(e) => onMaxVelocityChange(parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.maxVelocity.description}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px' }}>
                                Node limit: {nodeLimit}
                            </label>
                            <input
                                type="range"
                                min={PHYSICS_CONTROLS.nodeLimit.min}
                                max={PHYSICS_CONTROLS.nodeLimit.max}
                                step={PHYSICS_CONTROLS.nodeLimit.step}
                                value={nodeLimit}
                                onChange={(e) => onNodeLimitChange(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={descriptionStyle}>{PHYSICS_CONTROLS.nodeLimit.description}</div>
                        </div>
                    </>
                )}
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
