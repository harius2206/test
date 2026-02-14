import React from "react";
import Button from "../button/button";
import "./testResultCards.css";
import { useI18n } from "../../i18n";

export default function TestResultCards({ questions = [], onRetry }) {
    const { t } = useI18n();

    return (
        <div className="trc-container">
            {questions.map((q, index) => {
                const isSkipped = q.skipped;
                const isCorrect = !isSkipped && q.selected === q.correct;

                return (
                    <div
                        key={index}
                        className={`tq-card trc-result-card ${
                            isSkipped
                                ? "skipped"
                                : isCorrect
                                    ? "correct"
                                    : "wrong"
                        }`}
                    >
                        <div className="tq-header">
                            <div className="tq-counter">
                                {index + 1} / {questions.length}
                            </div>
                            <div className="tq-definition-label">{t("trcDefinition_label")}</div>
                            <div className="tq-definition">{q.question}</div>
                        </div>

                        <div className="tq-body">
                            <div className="tq-select-label">{t("trcSelectAnswer_label")}</div>
                            <div className="tq-options-grid">
                                {q.answers.map((opt, i) => {
                                    const isAnswerCorrect = i === q.correct;
                                    const isAnswerSelected = i === q.selected;

                                    let cls = "tq-option-static";
                                    if (isAnswerCorrect) cls += " correct";
                                    if (isAnswerSelected && !isAnswerCorrect)
                                        cls += " wrong";

                                    return (
                                        <div key={i} className={cls}>
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>

                            {isSkipped && (
                                <div className="tq-skipped-label">{t("trcSkipped_label")}</div>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="trc-retry-row">
                <Button
                    variant="toggle"
                    color="#6366f1"
                    width="200px"
                    height={40}
                    onClick={onRetry}
                >
                    {t("trcTryAgain_btn")}
                </Button>
            </div>
        </div>
    );
}
