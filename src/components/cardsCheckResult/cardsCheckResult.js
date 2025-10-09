// File: src/components/cardsCheckResult/cardsCheckResult.js (update)
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "../button/button";
import "./cardsCheckResult.css";

export default function CardsCheckResult({ learned, notLearned, total, time, avg, onRetry }) {
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
                            textColor: "#000",
                            pathColor: "#6ADE5A",
                            trailColor: "#DE5A5A",
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

                <Button variant="toggle" color="#6366f1" onClick={onRetry} height={50} width={150} >
                    <b>Try again</b>
                </Button>
            </div>
        </div>
    );
}