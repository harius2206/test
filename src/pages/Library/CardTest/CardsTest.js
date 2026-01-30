import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TestQuestionCard from "../../../components/testQuestionCard/testQuestionCard";
import CardsCheckResult from "../../../components/cardsCheckResult/cardsCheckResult";
import TestResultCards from "../../../components/testResultCards/TestResultCards";
import Button from "../../../components/button/button";
import closeIcon from "../../../images/close.svg";
import { getModuleCards, getModuleById } from "../../../api/modulesApi";

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
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Отримуємо ID модуля з URL або зі стейту
    const queryModuleId = searchParams.get("id");
    const stateModule = location.state?.module;

    // Визначаємо поточний ID та назву
    const moduleId = queryModuleId || stateModule?.id;
    const moduleName = stateModule?.name || "Module Test";

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);
    const [time, setTime] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [loading, setLoading] = useState(true);
    const topRef = useRef(null);

    // Основний ефект завантаження та підготовки даних
    useEffect(() => {
        const prepareData = async () => {
            setLoading(true);
            let rawCards = [];

            try {
                // ВАРІАНТ 1: Картки вже передані через навігацію (з ModuleView)
                if (stateModule && stateModule.cards && stateModule.cards.length > 0) {
                    // Використовуємо передані картки, вони вже мають структуру term/definition
                    rawCards = stateModule.cards;
                }
                // ВАРІАНТ 2: Карток немає, завантажуємо з API по ID
                else if (moduleId) {
                    // Пробуємо отримати картки модуля
                    const response = await getModuleCards({ module: moduleId });
                    const fetchedData = Array.isArray(response.data) ? response.data : (response.data.results || []);

                    // АДАПТАЦІЯ ДАНИХ (Бекенд -> Фронтенд)
                    // Якщо бекенд повертає original/translation, ми мапимо їх у term/definition
                    rawCards = fetchedData.map(c => ({
                        id: c.id,
                        term: c.term || c.original,             // Питання
                        definition: c.definition || c.translation // Відповідь
                    }));
                }

                if (!rawCards || rawCards.length === 0) {
                    setQuestions([]);
                } else {
                    const preparedQuestions = generateQuestions(rawCards);
                    setQuestions(preparedQuestions);
                }

            } catch (error) {
                console.error("Error loading cards for test:", error);
            } finally {
                setLoading(false);
            }
        };

        prepareData();
    }, [moduleId, stateModule]);

    // Логіка генерації питань
    const generateQuestions = (cards) => {
        // Фільтруємо картки, щоб не було пустих
        const validCards = cards.filter(c => c.term && c.definition);

        const shuffledCards = shuffle(validCards);

        return shuffledCards.map((card) => {
            const correctDefinition = card.definition;

            // Беремо всі інші визначення
            const otherDefinitions = validCards
                .filter((c) => c.id !== card.id)
                .map((c) => c.definition);

            // Вибираємо 3 випадкові неправильні
            const distractors = shuffle(otherDefinitions).slice(0, 3);

            // Формуємо варіанти
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
        if (finished || loading || questions.length === 0) return;
        const timer = setInterval(() => setTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, [finished, loading, questions.length]);

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
        setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 1);
    };

    const handleRetry = () => {
        setAnswers({});
        setFinished(false);
        setTime(0);
        setShowWarning(false);
        setQuestions(prev => shuffle(prev));
        setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 1);
    };

    const handleClose = () => {
        if (stateModule) {
            navigate("/library/module-view", { state: { module: stateModule } });
        } else if (moduleId) {
            // Якщо прийшли по посиланню, повертаємось на перегляд модуля по ID
            navigate(`/library/module-view?id=${moduleId}`);
        } else {
            navigate("/library");
        }
    };

    // Результати
    const learnedCount = Object.entries(answers).filter(([id, ans]) => {
        const q = questions.find((x) => x.id === Number(id));
        return q && ans === q.correct;
    }).length;

    const notLearnedCount = questions.length - learnedCount;
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

    if (loading) {
        return (
            <div className="ct-container">
                <div className="ct-header-fixed">
                    <div className="ct-header-row">
                        <span className="ct-title">Loading...</span>
                        <button className="ct-close-btn" onClick={() => navigate(-1)}>
                            <img src={closeIcon} alt="Close" />
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
                    Loading cards...
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="ct-container">
                <div className="ct-header-fixed">
                    <div className="ct-header-row">
                        <span className="ct-title">{moduleName}</span>
                        <button className="ct-close-btn" onClick={handleClose}>
                            <img src={closeIcon} alt="Close" />
                        </button>
                    </div>
                </div>
                <div style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
                    No cards found or module is empty.
                </div>
            </div>
        );
    }

    return (
        <div className="ct-container">
            {!finished ? (
                <>
                    <div className="ct-header-fixed" ref={topRef}>
                        <div className="ct-header-row">
                            <span className="ct-title">{moduleName}</span>
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
                    <div className="ct-header">
                        <div className="ct-header-row">
                            <span className="ct-title">{moduleName}</span>
                            <span className="ct-progress">
                                {questions.length} / {questions.length}
                            </span>
                            <button className="ct-close-btn" onClick={handleClose}>
                                <img src={closeIcon} alt="Close" />
                            </button>
                        </div>
                    </div>

                    <CardsCheckResult
                        learned={learnedCount}
                        notLearned={notLearnedCount}
                        total={questions.length}
                        time={time}
                        avg={avg}
                        onRetry={handleRetry}
                        moduleName={moduleName}
                    />

                    <TestResultCards questions={resultCards} onRetry={handleRetry}/>
                </>
            )}
        </div>
    );
}