import React from "react";
import "./css/progressBar.css";

const BACKGROUND_COLOR = "#e0e0e0";
const HEIGHT = "16px";

interface ProgressBarProps {
    progress: number; // 0 to 100
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div
            className="progress-bar-container"
            style={{ backgroundColor: BACKGROUND_COLOR, height: HEIGHT }}
        >
            <div
                className={'progress-bar-fill striped animated'}
                style={{
                    width: `${progress}%`,
                    backgroundColor: 'var(--novelty-blue)',
                    height: "100%",
                }}
            />
        </div>
    );
};

export default ProgressBar;
