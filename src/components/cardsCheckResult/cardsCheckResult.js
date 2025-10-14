import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "../button/button";
import "./cardsCheckResult.css";

export default function CardsCheckResult({ learned, notLearned, total, time, avg, onRetry }) {
    const [themeColors, setThemeColors] = useState({
        text: "#000",
        path: "#6ADE5A",
        trail: "#DE5A5A",
        accent: "#6366f1",
        black: "#000000",
    });

    useEffect(() => {
        const root = getComputedStyle(document.documentElement);
        setThemeColors({
            text: root.getPropertyValue("--ccr-text").trim() || "#000",
            path: root.getPropertyValue("--ccr-learned").trim() || "#6ADE5A",
            trail: root.getPropertyValue("--ccr-notlearned").trim() || "#DE5A5A",
            accent: "#6366f1",
            black: "#000000",
        });
    }, []);

    const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;

    return (
        <div className="ccr-container">
            <div className="ccr-stats-wrapper">
                <div className="ccr-progress">
                    <CircularProgressbar
                        value={percentage}
                        text={`${percentage}%`}
                        strokeWidth={14}
                        styles={buildStyles({
                            textColor: themeColors.text,
                            pathColor: themeColors.path,
                            trailColor: themeColors.trail,
                            textSize: "18px",
                            pathTransitionDuration: 0.1,
                            strokeLinecap: "butt",
                        })}
                    />
                </div>

                <div className="ccr-stats">
                    <p>
                        <span className="ccr-learned">Learned </span>
                        <span className="ccr-learned ccr-count">{learned}</span>
                    </p>
                    <p>
                        <span className="ccr-notlearned">Not learned </span>
                        <span className="ccr-notlearned ccr-count">{notLearned}</span>
                    </p>
                </div>
            </div>

            <div className="ccr-footer-row">
                <div className="ccr-time">
                    <p>Time: {time}s.</p>
                    <p>Average time: {avg}s.</p>
                </div>

                <Button
                    variant="outlined"
                    style={{
                        backgroundColor: themeColors.black,
                        color: themeColors.accent,
                        border: `2px solid ${themeColors.accent}`,
                        height: 50,
                        width: 150,
                        fontWeight: 600,
                        fontSize: "15px",
                        transition: "background 0.2s ease, opacity 0.2s ease",
                    }}
                    onClick={onRetry}
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}
