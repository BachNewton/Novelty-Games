import React from "react";
import "./css/progressBar.css";

type ProgressBarProps = {
    progress: number; // 0 to 100
    height?: string;
    color?: string;
    backgroundColor?: string;
    animated?: boolean; // Controls the striped animation
};

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = "16px",
    color = "#4caf50",
    backgroundColor = "#e0e0e0",
    animated = true,
}) => {
    return (
        <div
            className="progress-bar-container"
            style={{ backgroundColor, height }}
        >
            <div
                className={`progress-bar-fill ${animated ? "striped animated" : ""}`}
                style={{
                    width: `${progress}%`,
                    backgroundColor: color,
                    height: "100%",
                }}
            />
        </div>
    );
};

export default ProgressBar;
