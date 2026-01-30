import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CardsCheckCard from "../../../components/cardsCheckCard/cardsCheckCard";
import CardsCheckResult from "../../../components/cardsCheckResult/cardsCheckResult";
import closeIcon from "../../../images/close.svg";
import { getModuleById, updateCardLearnStatus } from "../../../api/modulesApi"; // Використовуємо getModuleById для отримання карток конкретного модуля
import "./cardsCheck.css";

export default function CardsCheck() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const moduleIdFromUrl = searchParams.get("id");
    const originatingModule = location.state?.module;
    const moduleId = moduleIdFromUrl || originatingModule?.id;

    const [moduleName, setModuleName] = useState(originatingModule?.name || "Module");

    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const [current, setCurrent] = useState(0);
    const [learned, setLearned] = useState(0);
    const [notLearned, setNotLearned] = useState(0);
    const [finished, setFinished] = useState(false);

    const [time, setTime] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (moduleId) {
            setLoading(true);
            getModuleById(moduleId)
                .then((res) => {
                    const data = res.data;
                    if (data.name) setModuleName(data.name);

                    const loadedCards = (data.cards || []).map(c => ({
                        ...c,
                        term: c.original,
                        definition: c.translation
                    }));
                    setCards(loadedCards);
                })
                .catch((err) => {
                    console.error("Error fetching module cards:", err);
                    setCards([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [moduleId]);

    // Таймер
    useEffect(() => {
        if (!loading && cards.length > 0 && !finished) {
            intervalRef.current = setInterval(() => {
                setTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [loading, cards.length, finished]);

    const handleAnswer = async (isLearned) => {
        if (isLearned) setLearned((prev) => prev + 1);
        else setNotLearned((prev) => prev + 1);

        const currentCard = cards[current];
        if (currentCard && currentCard.id) {
            try {

                await updateCardLearnStatus(currentCard.id, isLearned, {
                    original: currentCard.term,
                    translation: currentCard.definition,
                    learned: "learned"
                });
            } catch (error) {
                console.error("Failed to update card status:", error);
            }
        }

        if (current + 1 < cards.length) {
            setCurrent((prev) => prev + 1);
        } else {
            setFinished(true);
            clearInterval(intervalRef.current);
        }
    };

    const handleRetry = () => {
        setCurrent(0);
        setLearned(0);
        setNotLearned(0);
        setFinished(false);
        setTime(0);

        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);
    };

    const handleClose = () => {
        clearInterval(intervalRef.current);
        if (moduleId) {
            navigate(`/library/module-view?id=${moduleId}`, { state: { module: { id: moduleId, name: moduleName } } });
        } else {
            navigate(-1);
        }
    };

    const avg = (learned + notLearned) > 0
        ? (time / (learned + notLearned)).toFixed(1)
        : 0;

    // Стан завантаження
    if (loading) {
        return <div className="cc-page"><div className="cc-header"><h3>Loading...</h3></div></div>;
    }

    // Якщо карток немає
    if (!loading && cards.length === 0) {
        return (
            <div className="cc-page">
                <div className="cc-header">
                    <h2 className="cc-module-title">{moduleName}</h2>
                    <button className="cc-close-btn" onClick={handleClose}>
                        <img src={closeIcon} alt="Close" />
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p>No cards in this module.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cc-page">
            <div className="cc-header">
                <h2 className="cc-module-title">{moduleName}</h2>

                <div className="cc-progress">
                    {current + 1}/{cards.length}
                </div>

                <button className="cc-close-btn" onClick={handleClose}>
                    <img src={closeIcon} alt="Close" />
                </button>
            </div>

            {!finished ? (
                <CardsCheckCard
                    term={cards[current].term}
                    definition={cards[current].definition}
                    learnedCount={learned}
                    notLearnedCount={notLearned}
                    onAnswer={handleAnswer}
                />
            ) : (
                <CardsCheckResult
                    learned={learned}
                    notLearned={notLearned}
                    total={cards.length}
                    time={time}
                    avg={avg}
                    onRetry={handleRetry}
                />
            )}
        </div>
    );
}