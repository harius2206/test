import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "../button/button";
import "./cardsCheckResult.css";

export default function CardsCheckResult({ learned, notLearned, total, time, avg, onRetry }) {
    const percentage = Math.round((learned / total) * 100);

    return (
        <div className="ccr-container">
            <div className="ccr-stats-wrapper">
                <div className="ccr-progress">
                    <CircularProgressbar
                        value={percentage}
                        text={`${percentage}%`}
                        styles={buildStyles({
                            textColor: "#000",
                            pathColor: "#388e3c",    // match correct button color
                            trailColor: "#d32f2f",   // match wrong button color
                            textSize: "22px",
                            pathTransitionDuration: 0.5,
                        })}
                    />
                </div>

                <div className="ccr-stats">
                    <p>
                        <span className="ccr-learned">Learned</span>{" "}
                        <span className="ccr-learned ccr-count">{learned}</span>
                    </p>
                    <p>
                        <span className="ccr-notlearned">Not learned</span>{" "}
                        <span className="ccr-notlearned ccr-count">{notLearned}</span>
                    </p>
                </div>
            </div>

            <div className="ccr-time">
                <p>Time: {time}s.</p>
                <p>Average time: {avg}s.</p>
            </div>

            <Button variant="static" color="#494ec5" onClick={onRetry}>
                Try again
            </Button>
        </div>
    );
}