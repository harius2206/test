// src/pages/Library/CardsCheck/CardsCheck.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardsCheckCard from "../../../components/cardsCheckCard/cardsCheckCard";
import CardsCheckResult from "../../../components/cardsCheckResult/cardsCheckResult";
import closeIcon from "../../../images/close.svg";
import "./cardsCheck.css";

export default function CardsCheck() {
    const location = useLocation();
    const navigate = useNavigate();
    const originatingModule = location.state?.module;

    const moduleName = originatingModule?.name || "Polisz";
    const words = [
        { term: "kot", definition: "cat" },
        { term: "pies", definition: "dog" },
        { term: "dom", definition: "house" },
        { term: "oko", definition: "eye" },
        { term: "ucho", definition: "ear" },
        { term: "noga", definition: "leg" },
        { term: "ręka", definition: "hand" },
        { term: "głowa", definition: "head" },
        { term: "słońce", definition: "sun" },
        { term: "księżyc", definition: "moon" },
    ];

    const [current, setCurrent] = useState(0);
    const [learned, setLearned] = useState(0);
    const [notLearned, setNotLearned] = useState(0);
    const [finished, setFinished] = useState(false);

    const [time, setTime] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const handleAnswer = (isLearned) => {
        if (isLearned) setLearned(prev => prev + 1);
        else setNotLearned(prev => prev + 1);

        if (current + 1 < words.length) {
            setCurrent(prev => prev + 1);
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
            setTime(prev => prev + 1);
        }, 1000);
    };

    const handleClose = () => {
        clearInterval(intervalRef.current);
        if (originatingModule) {
            navigate("/library/module-view", { state: { module: originatingModule } });
        } else {
            navigate(-1);
        }
    };

    const avg = (learned + notLearned) > 0
        ? (time / (learned + notLearned)).toFixed(1)
        : 0;

    return (
        <div className="cc-page">
            <div className="cc-header">
                <h2 className="cc-module-title">{moduleName}</h2>

                <div className="cc-progress">
                    {current + 1}/{words.length}
                </div>

                <button className="cc-close-btn" onClick={handleClose}>
                    <img src={closeIcon} alt="Close" />
                </button>
            </div>

            {!finished ? (
                <CardsCheckCard
                    term={words[current].term}
                    definition={words[current].definition}
                    learnedCount={learned}
                    notLearnedCount={notLearned}
                    onAnswer={handleAnswer}
                />
            ) : (
                <CardsCheckResult
                    learned={learned}
                    notLearned={notLearned}
                    total={words.length}
                    time={time}
                    avg={avg}
                    onRetry={handleRetry}
                />
            )}
        </div>
    );
}
