import { useState, useEffect } from "react";
import { SnakeAI } from "../SnakeAI";
import { Direction } from "../SnakeWorld";

interface AIVisualizationProps {
    getAI: () => SnakeAI | null;
    getAIMode: () => boolean;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    onResetAI: () => void;
}

const FEATURE_NAMES = [
    "Food X",
    "Food Y",
    "Danger Up",
    "Danger Down",
    "Danger Left",
    "Danger Right",
    "Dir Up",
    "Dir Down",
    "Dir Left",
    "Dir Right",
    "Wall Top",
    "Wall Bottom",
    "Wall Left",
    "Wall Right"
];

const DIRECTION_NAMES = ["UP", "DOWN", "LEFT", "RIGHT"];

export function AIVisualization({ getAI, getAIMode, getVisible, setVisible, onResetAI }: AIVisualizationProps) {
    const [stats, setStats] = useState<ReturnType<SnakeAI['getStats']> | null>(null);
    const [decisionInfo, setDecisionInfo] = useState<ReturnType<SnakeAI['getDecisionInfo']> | null>(null);
    const [showFeatures, setShowFeatures] = useState(true);
    const [visible, setVisibleState] = useState(false);

    // Sync with external visibility state
    useEffect(() => {
        const checkVisibility = () => {
            const isVisible = getVisible();
            if (isVisible !== visible) {
                setVisibleState(isVisible);
            }
        };

        // Check visibility periodically (only when component is mounted)
        const interval = setInterval(checkVisibility, 50);
        checkVisibility(); // Check immediately

        return () => clearInterval(interval);
    }, [getVisible, visible]);

    useEffect(() => {
        if (!visible) return;

        const interval = setInterval(() => {
            const ai = getAI();
            const aiMode = getAIMode();
            if (ai) {
                setStats(ai.getStats());
                if (aiMode) {
                    setDecisionInfo(ai.getDecisionInfo());
                } else {
                    setDecisionInfo(null);
                }
            } else {
                setStats(null);
                setDecisionInfo(null);
            }
        }, 100); // Update 10 times per second

        return () => clearInterval(interval);
    }, [getAI, getAIMode, visible]);

    const ai = getAI();
    const aiMode = getAIMode();

    if (!ai || !visible) {
        return null;
    }

    // Define styles and callbacks before early returns
    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '90vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        overflowY: 'auto',
        border: '2px solid #60a5fa',
        pointerEvents: 'auto',
        zIndex: 1000
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid #60a5fa',
        paddingBottom: '10px'
    };

    const buttonStyle: React.CSSProperties = {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderRadius: '4px'
    };

    const onClose = () => {
        setVisible(false); // Update external state, which will sync back via useEffect
    };

    const graphContainerStyle: React.CSSProperties = {
        height: '150px',
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        marginTop: '10px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h3 style={{ margin: 0, color: '#60a5fa' }}>AI Learning Dashboard</h3>
                <button style={buttonStyle} onClick={onClose}>✕</button>
            </div>

            {stats && (
                <>
                    {/* Statistics Section */}
                    <div style={sectionStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <strong style={{ color: '#60a5fa' }}>Statistics</strong>
                            <button
                                style={{ ...buttonStyle, backgroundColor: '#ef4444', fontSize: '10px', padding: '3px 8px' }}
                                onClick={() => {
                                    if (window.confirm('Reset AI learning? This will clear all progress and start fresh.')) {
                                        onResetAI();
                                    }
                                }}
                            >
                                Reset AI
                            </button>
                        </div>
                        <div>Games Played: {stats.gamesPlayed}</div>
                        <div>Best Score: {stats.bestScore}</div>
                        <div>Average Score: {stats.averageScore.toFixed(1)}</div>
                        <div>Exploration Rate: {(stats.explorationRate * 100).toFixed(1)}%</div>
                    </div>

                    {/* Learning Progress Graph */}
                    {stats.scoreHistory.length > 0 && (
                        <div style={sectionStyle}>
                            <strong style={{ color: '#60a5fa' }}>Learning Progress</strong>
                            <div style={graphContainerStyle}>
                                <ScoreGraph scores={stats.scoreHistory} />
                            </div>
                        </div>
                    )}

                    {/* Decision Making */}
                    {decisionInfo && (
                        <div style={sectionStyle}>
                            <strong style={{ color: '#60a5fa' }}>Current Decision</strong>
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>Action Probabilities:</strong>
                                    {decisionInfo.probabilities.map((prob, idx) => (
                                        <div key={idx} style={{ marginTop: '5px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ width: '60px' }}>{DIRECTION_NAMES[idx]}:</span>
                                                <div style={{
                                                    flex: 1,
                                                    height: '20px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '4px',
                                                    margin: '0 10px',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${prob * 100}%`,
                                                        height: '100%',
                                                        backgroundColor: idx === decisionInfo.selectedAction ? '#22c55e' : '#60a5fa',
                                                        transition: 'width 0.1s'
                                                    }} />
                                                </div>
                                                <span style={{ width: '50px', textAlign: 'right' }}>
                                                    {(prob * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '11px', color: '#9ca3af' }}>
                                    Selected: <strong style={{ color: '#22c55e' }}>
                                        {DIRECTION_NAMES[decisionInfo.selectedAction]}
                                    </strong>
                                    {decisionInfo.wasExploration && (
                                        <span style={{ color: '#fbbf24', marginLeft: '10px' }}>(Exploring)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Features */}
                    {decisionInfo && (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <strong style={{ color: '#60a5fa' }}>Input Features</strong>
                                <button
                                    style={{ ...buttonStyle, backgroundColor: '#60a5fa', padding: '3px 8px', fontSize: '10px' }}
                                    onClick={() => setShowFeatures(!showFeatures)}
                                >
                                    {showFeatures ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showFeatures && (
                                <div style={{ fontSize: '10px' }}>
                                    {decisionInfo.features.map((value, idx) => (
                                        <div key={idx} style={{ marginTop: '3px', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ width: '120px' }}>{FEATURE_NAMES[idx]}:</span>
                                            <div style={{
                                                flex: 1,
                                                height: '15px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '2px',
                                                margin: '0 10px',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${Math.abs(value) * 100}%`,
                                                    height: '100%',
                                                    backgroundColor: value >= 0 ? '#22c55e' : '#ef4444',
                                                    marginLeft: value < 0 ? 'auto' : '0',
                                                    marginRight: value < 0 ? '0' : 'auto'
                                                }} />
                                            </div>
                                            <span style={{ width: '60px', textAlign: 'right' }}>
                                                {value.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ScoreGraph({ scores }: { scores: number[] }) {
    if (scores.length === 0) return null;

    const maxScore = Math.max(...scores, 1);
    const width = 100;
    const height = 100;
    const step = width / Math.max(scores.length - 1, 1);

    // Sample scores for display (show last 100 points)
    const displayScores = scores.slice(-100);
    const displayStep = width / Math.max(displayScores.length - 1, 1);

    const points = displayScores.map((score, idx) => {
        const x = idx * displayStep;
        const y = height - (score / maxScore) * height;
        return `${x},${y}`;
    }).join(' ');

    // Calculate moving average
    const windowSize = 10;
    const averages: number[] = [];
    for (let i = 0; i < displayScores.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = i + 1;
        const slice = displayScores.slice(start, end);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        averages.push(avg);
    }

    const avgPoints = averages.map((avg, idx) => {
        const x = idx * displayStep;
        const y = height - (avg / maxScore) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
                <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="0.5"
                />
            ))}
            {/* Average line */}
            <polyline
                points={avgPoints}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
            />
            {/* Score line */}
            <polyline
                points={points}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.5"
                opacity="0.6"
            />
        </svg>
    );
}

export function createAIVisualizationOverlay(
    getAI: () => SnakeAI | null,
    getAIMode: () => boolean,
    getVisible: () => boolean,
    setVisible: (visible: boolean) => void,
    onResetAI: () => void
): JSX.Element {
    return <AIVisualization getAI={getAI} getAIMode={getAIMode} getVisible={getVisible} setVisible={setVisible} onResetAI={onResetAI} />;
}

