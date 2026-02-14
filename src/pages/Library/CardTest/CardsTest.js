import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TestQuestionCard from "../../../components/testQuestionCard/testQuestionCard";
import CardsCheckResult from "../../../components/cardsCheckResult/cardsCheckResult";
import TestResultCards from "../../../components/testResultCards/TestResultCards";
import Button from "../../../components/button/button";
import closeIcon from "../../../images/close.svg";
import { getModuleCards } from "../../../api/modulesApi";
import { useI18n } from "../../../i18n";

import "./cardsTest.css";

// Допоміжна функція для перемішування масиву
const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export default function CardsTest() {
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Отримуємо ID модуля з URL або зі стейту
    const ctQueryModuleId = searchParams.get("id");
    const ctStateModule = location.state?.module;

    // Визначаємо поточний ID та назву
    const ctModuleId = ctQueryModuleId || ctStateModule?.id;
    const ctModuleName = ctStateModule?.name || t("ctModuleDefault");

    const [ctQuestions, ctSetQuestions] = useState([]);
    const [ctAnswers, ctSetAnswers] = useState({});
    const [ctFinished, ctSetFinished] = useState(false);
    const [ctTime, ctSetTime] = useState(0);
    const [ctShowWarning, ctSetShowWarning] = useState(false);
    const [ctLoading, ctSetLoading] = useState(true);
    const ctTopRef = useRef(null);

    // Основний ефект завантаження та підготовки даних
    useEffect(() => {
        const ctPrepareData = async () => {
            ctSetLoading(true);
            let ctRawCards = [];

            try {
                if (ctStateModule && ctStateModule.cards && ctStateModule.cards.length > 0) {
                    ctRawCards = ctStateModule.cards;
                }
                else if (ctModuleId) {
                    const response = await getModuleCards({ module: ctModuleId });
                    const fetchedData = Array.isArray(response.data) ? response.data : (response.data.results || []);

                    ctRawCards = fetchedData.map(c => ({
                        id: c.id,
                        term: c.term || c.original,
                        definition: c.definition || c.translation
                    }));
                }

                if (!ctRawCards || ctRawCards.length === 0) {
                    ctSetQuestions([]);
                } else {
                    const ctPreparedQuestions = ctGenerateQuestions(ctRawCards);
                    ctSetQuestions(ctPreparedQuestions);
                }

            } catch (error) {
                console.error("Error loading cards for test:", error);
            } finally {
                ctSetLoading(false);
            }
        };

        ctPrepareData();
    }, [ctModuleId, ctStateModule, t]);

    // Логіка генерації питань
    const ctGenerateQuestions = (cards) => {
        const validCards = cards.filter(c => c.term && c.definition);
        const shuffledCards = shuffle(validCards);

        return shuffledCards.map((card) => {
            const correctDefinition = card.definition;
            const otherDefinitions = validCards
                .filter((c) => c.id !== card.id)
                .map((c) => c.definition);

            const distractors = shuffle(otherDefinitions).slice(0, 3);
            const options = shuffle([correctDefinition, ...distractors]);

            return {
                id: card.id,
                term: card.term,
                correct: correctDefinition,
                options: options,
            };
        });
    };

    // Таймер
    useEffect(() => {
        if (ctFinished || ctLoading || ctQuestions.length === 0) return;
        const timer = setInterval(() => ctSetTime((prev) => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [ctFinished, ctLoading, ctQuestions.length]);

    const ctHandleSelect = (id, answer) => {
        ctSetAnswers((prev) => ({ ...prev, [id]: answer }));
    };

    const ctHandleSkip = (id) => {
        ctSetAnswers((prev) => ({ ...prev, [id]: "skipped" }));
    };

    const ctHandleSend = () => {
        const unanswered = ctQuestions.find((q) => !ctAnswers[q.id]);
        if (unanswered) {
            ctSetShowWarning(true);
            const el = document.getElementById(`question-${unanswered.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        ctSetShowWarning(false);
        ctSetFinished(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 1);
    };

    const ctHandleRetry = () => {
        ctSetAnswers({});
        ctSetFinished(false);
        ctSetTime(0);
        ctSetShowWarning(false);
        ctSetQuestions(prev => shuffle(prev));
        setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 1);
    };

    const ctHandleClose = () => {
        if (ctStateModule) {
            navigate("/library/module-view", { state: { module: ctStateModule } });
        } else if (ctModuleId) {
            navigate(`/library/module-view?id=${ctModuleId}`);
        } else {
            navigate("/library");
        }
    };

    // Результати
    const ctLearnedCount = Object.entries(ctAnswers).filter(([id, ans]) => {
        const q = ctQuestions.find((x) => x.id === Number(id));
        return q && ans === q.correct;
    }).length;

    const ctNotLearnedCount = ctQuestions.length - ctLearnedCount;
    const ctAvg = ctQuestions.length > 0 ? (ctTime / ctQuestions.length).toFixed(1) : 0;

    const ctResultCards = ctQuestions.map((q) => {
        const userAnswer = ctAnswers[q.id];
        return {
            question: q.term,
            answers: q.options,
            correct: q.options.indexOf(q.correct),
            selected: userAnswer && userAnswer !== "skipped" ? q.options.indexOf(userAnswer) : null,
            skipped: userAnswer === "skipped",
        };
    });

    if (ctLoading) {
        return (
            <div className="ct-container">
                <div className="ct-header-fixed">
                    <div className="ct-header-row">
                        <span className="ct-title">{t("ctLoading")}</span>
                        <button className="ct-close-btn" onClick={() => navigate(-1)}>
                            <img src={closeIcon} alt="Close" />
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
                    {t("ctLoading")}
                </div>
            </div>
        );
    }

    if (!ctQuestions.length) {
        return (
            <div className="ct-container">
                <div className="ct-header-fixed">
                    <div className="ct-header-row">
                        <span className="ct-title">{ctModuleName}</span>
                        <button className="ct-close-btn" onClick={ctHandleClose}>
                            <img src={closeIcon} alt="Close" />
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
                    {t("ctNoCards")}
                </div>
            </div>
        );
    }

    return (
        <div className="ct-container">
            {!ctFinished ? (
                <>
                    <div className="ct-header-fixed" ref={ctTopRef}>
                        <div className="ct-header-row">
                            <span className="ct-title">{ctModuleName}</span>
                            <span className="ct-progress">
                                {Object.keys(ctAnswers).length} / {ctQuestions.length}
                            </span>
                            <button className="ct-close-btn" onClick={ctHandleClose}>
                                <img src={closeIcon} alt="Close" />
                            </button>
                        </div>
                        {ctShowWarning && (
                            <div className="ct-warning-text">
                                {t("ctSendWarning")}
                            </div>
                        )}
                    </div>

                    <div className="ct-questions-list">
                        {ctQuestions.map((q, idx) => (
                            <TestQuestionCard
                                key={q.id}
                                question={q}
                                index={idx}
                                total={ctQuestions.length}
                                selected={ctAnswers[q.id]}
                                onSelect={ctHandleSelect}
                                onSkip={ctHandleSkip}
                            />
                        ))}
                    </div>

                    <div className="ct-send-row">
                        <Button
                            variant="toggle"
                            color="#6366f1"
                            width="200px"
                            onClick={ctHandleSend}
                            height={40}
                        >
                            {t("ctSendBtn")}
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="ct-header">
                        <div className="ct-header-row">
                            <span className="ct-title">{ctModuleName}</span>
                            <span className="ct-progress">
                                {ctQuestions.length} / {ctQuestions.length}
                            </span>
                            <button className="ct-close-btn" onClick={ctHandleClose}>
                                <img src={closeIcon} alt="Close" />
                            </button>
                        </div>
                    </div>

                    <CardsCheckResult
                        learned={ctLearnedCount}
                        notLearned={ctNotLearnedCount}
                        total={ctQuestions.length}
                        time={ctTime}
                        avg={ctAvg}
                        onRetry={ctHandleRetry}
                        moduleName={ctModuleName}
                    />

                    <TestResultCards questions={ctResultCards} onRetry={ctHandleRetry}/>
                </>
            )}
        </div>
    );
}