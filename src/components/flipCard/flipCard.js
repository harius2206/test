import React from "react";
import "./flipCard.css";

export default function FlipCard({ frontContent, backContent, flipped, onFlip, height = 320, fontSize = 36 }) {
    return (
        <div
            className="fc-card"
            onClick={onFlip}
            style={{ height: height }}
        >
            <div className={`fc-card-inner ${flipped ? "fc-flipped" : ""}`}>
                <div className="fc-face fc-front" style={{ fontSize: fontSize }}>
                    {frontContent}
                </div>
                <div className="fc-face fc-back" style={{ fontSize: fontSize }}>
                    {backContent}
                </div>
            </div>
        </div>
    );
}
