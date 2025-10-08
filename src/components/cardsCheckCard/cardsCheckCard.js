import React, { useState } from "react";
import FlipCard from "../flipCard/flipCard";
import { ReactComponent as CheckIcon } from "../../images/cross.svg";
import { ReactComponent as CrossIcon } from "../../images/tickTest.svg";
import "./cardsCheckCard.css";

export default function CardsCheckCard({ term, definition, learnedCount, notLearnedCount, onAnswer }) {
    const [flipped, setFlipped] = useState(false);

    const handleFlip = () => setFlipped((prev) => !prev);

    return (
        <div className="ccc-container">
            <FlipCard
                frontContent={<p className="ccc-term">{term}</p>}
                backContent={<p className="ccc-definition">{definition}</p>}
                flipped={flipped}
                onFlip={handleFlip}
            />
            <div className="ccc-counters">
                <span className="ccc-notlearned-count">{notLearnedCount}</span>
                <button className="ccc-btn-wrong" onClick={() => onAnswer(false)}>
                    <CheckIcon />
                </button>
                <button className="ccc-btn-correct" onClick={() => onAnswer(true)}>
                    <CrossIcon />
                </button>
                <span className="ccc-learned-count">{learnedCount}</span>
            </div>
        </div>
    );
}
