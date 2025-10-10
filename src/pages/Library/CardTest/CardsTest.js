// File: src/pages/Library/CardTest/CardsTest.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TestQuestionCard from "../../../components/testQuestionCard/testQuestionCard";
import CardsCheckResult from "../../../components/cardsCheckResult/cardsCheckResult";
import TestResultCards from "../../../components/testResultCards/TestResultCards";
import Button from "../../../components/button/button";
import closeIcon from "../../../images/close.svg";

import "./cardsTest.css";

export default function CardsTest() {
    const location = useLocation();
    const navigate = useNavigate();
    const originatingModule = location.state?.module;

    const module = originatingModule || { name: "English Basics" };

    const questions = [
        { id: 1, term: "kot", correct: "cat", options: ["cat", "dog", "house", "eye"] },
        { id: 2, term: "dom", correct: "house", options: ["eye", "dog", "house", "car"] },
        { id: 3, term: "pies", correct: "dog", options: ["cat", "dog", "tree", "table"] },
    ];

    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);
    const [time, setTime] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const topRef = useRef(null);

    // таймер
    useEffect(() => {
        if (finished) return;
        const timer = setInterval(() => setTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, [finished]);

    // обробка вибору
    const handleSelect = (id, answer) => {
        setAnswers((prev) => ({ ...prev, [id]: answer }));
    };

    const handleSkip = (id) => {
        setAnswers((prev) => ({ ...prev, [id]: "skipped" }));
    };

    const handleSend = () => {
        const unanswered = questions.find((q) => !answers[q.id]);
        if (unanswered) {
            setShowWarning(true);
            const el = document.getElementById(`question-${unanswered.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        setShowWarning(false);
        setFinished(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "auto" });
        }, 1);
    };

    const handleRetry = () => {
        setAnswers({});
        setFinished(false);
        setTime(0);
        setShowWarning(false);

        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "auto" });
        }, 1);
    };
    const handleClose = () => {
        if (originatingModule) {
            navigate("/library/module-view", { state: { module: originatingModule } });
        } else {
            navigate(-1);
        }
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "auto" });
        }, 1);
    };

    // підрахунок результатів
    const learned = Object.entries(answers).filter(([id, ans]) => {
        const q = questions.find((x) => x.id === Number(id));
        return ans === q.correct;
    }).length;

    const notLearned = questions.length - learned;
    const avg = questions.length > 0 ? (time / questions.length).toFixed(1) : 0;

    const resultCards = questions.map((q) => {
        const userAnswer = answers[q.id];
        return {
            question: q.term,
            answers: q.options,
            correct: q.options.indexOf(q.correct),
            selected: userAnswer && userAnswer !== "skipped" ? q.options.indexOf(userAnswer) : null,
            skipped: userAnswer === "skipped",
        };
    });

    return (
        <div className="ct-container">
            {!finished ? (
                <>
                    <div className="ct-header-fixed" ref={topRef}>
                        <div className="ct-header-row">
                            <span className="ct-title">{module.name}</span>
                            <span className="ct-progress">
                                {Object.keys(answers).length} / {questions.length}
                            </span>

                            <button className="ct-close-btn" onClick={handleClose}>
                                <img src={closeIcon} alt="Close" />
                            </button>
                        </div>
                        {showWarning && (
                            <div className="ct-warning-text">
                                Please answer all questions before sending.
                            </div>
                        )}
                    </div>

                    <div className="ct-questions-list">
                        {questions.map((q, idx) => (
                            <TestQuestionCard
                                key={q.id}
                                question={q}
                                index={idx}
                                total={questions.length}
                                selected={answers[q.id]}
                                onSelect={handleSelect}
                                onSkip={handleSkip}
                            />
                        ))}
                    </div>

                    <div className="ct-send-row">
                        <Button
                            variant="toggle"
                            color="#6366f1"
                            width="200px"
                            onClick={handleSend}
                            height={40}
                        >
                            Send
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    {/* Заголовок при завершенні */}
                    <div className="ct-header">
                        <div className="ct-header-row">
                            <span className="ct-title">{module.name}</span>
                            <span className="ct-progress">
                                {questions.length} / {questions.length}
                            </span>

                            <button className="ct-close-btn" onClick={handleClose}>
                                <img src={closeIcon} alt="Close" />
                            </button>
                        </div>
                    </div>

                    <CardsCheckResult
                        learned={learned}
                        notLearned={notLearned}
                        total={questions.length}
                        time={time}
                        avg={avg}
                        onRetry={handleRetry}
                        moduleName={module.name}
                    />

                    <TestResultCards questions={resultCards} onRetry={handleRetry}/>
                </>
            )}
        </div>
    );
}
