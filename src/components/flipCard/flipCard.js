import React from "react";
import "./flipCard.css";

export default function FlipCard({ frontContent, backContent, flipped, onFlip }) {
    return (
        <div className="fc-card" onClick={onFlip}>
            <div className={`fc-card-inner ${flipped ? "fc-flipped" : ""}`}>
                <div className="fc-face fc-front">{frontContent}</div>
                <div className="fc-face fc-back">{backContent}</div>
            </div>
        </div>
    );
}
