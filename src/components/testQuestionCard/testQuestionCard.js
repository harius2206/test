import React from "react";
import "./testQuestionCard.css";

export default function TestQuestionCard({
                                             question,
                                             index,
                                             total,
                                             selected,
                                             onSelect,
                                             onSkip,
                                         }) {
    const isSkipped = selected === "skipped";

    return (
        <div className="tq-card" id={`question-${question.id}`}>
            <div className="tq-header">
                <div className="tq-definition-label">Definition</div>
                <div className="tq-counter">
                    {index + 1} / {total}
                </div>
            </div>

            <div className="tq-definition">{question.term}</div>


            <div className="tq-body">
                <div className="tq-select-label">Select answer:</div>
                <div className="tq-options-grid">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            className={`tq-option-btn ${selected === opt ? "selected" : ""}`}
                            onClick={() => onSelect(question.id, opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <button
                    className={`tq-skip-btn ${isSkipped ? "active" : ""}`}
                    onClick={() => onSkip(question.id)}
                >
                    Skip
                </button>
            </div>
        </div>
    );
}
