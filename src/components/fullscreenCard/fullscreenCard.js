import React, { useState, useEffect, useRef } from "react";
import FlipCard from "../flipCard/flipCard";
// Імпорт іконок
import { ReactComponent as CloseIcon } from "../../images/close.svg";
import { ReactComponent as PrevIcon } from "../../images/arrowLeft.svg";
import { ReactComponent as NextIcon } from "../../images/arrowRight.svg";
import { ReactComponent as PlayIcon } from "../../images/play.svg";
import { ReactComponent as PauseIcon } from "../../images/pause.svg";
import { ReactComponent as RestartIcon } from "../../images/restart.svg";
import { ReactComponent as FullscreenIcon } from "../../images/expand.svg"; // Для виходу
import { ReactComponent as BookSvg } from "../../images/book.svg";
import { ReactComponent as SaveIcon } from "../../images/save.svg";

// Використовуємо існуючі стилі
import "../../pages/Library/ModuleView/moduleView.css";

export default function FullscreenCard({
                                           cards,
                                           initialIndex = 0,
                                           onClose,
                                           onUpdateCardStatus, // (id, type) => void
                                           checkIsLearned, // (id) => boolean
                                           checkIsSaved,   // (id) => boolean
                                       }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [flipped, setFlipped] = useState(false);
    const [autoplay, setAutoplay] = useState(false);
    const autoplayRef = useRef(null);
    const autoplayInterval = 3000;

    // Блокування скролу
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Автоплей
    useEffect(() => {
        if (autoplay) {
            autoplayRef.current = setInterval(() => {
                setCurrentIndex((prev) => {
                    if (prev < cards.length - 1) return prev + 1;
                    return 0;
                });
                setFlipped(false);
            }, autoplayInterval);
        } else {
            clearInterval(autoplayRef.current);
        }
        return () => clearInterval(autoplayRef.current);
    }, [autoplay, cards.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
        setFlipped(false);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
        setFlipped(false);
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setFlipped(false);
    };

    const currentCard = cards[currentIndex];
    const frontText = currentCard.term || currentCard.original;
    const backText = currentCard.definition || currentCard.translation;
    const cardId = currentCard.id;

    const isLearned = checkIsLearned ? checkIsLearned(cardId) : currentCard.is_learned;
    const isSaved = checkIsSaved ? checkIsSaved(cardId) : currentCard.is_saved;

    const actionIconsOverlay = (
        <div className="card-actions-overlay">
            <button
                className={`mv-card-book ${isLearned ? "mv-active" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCardStatus(cardId, 'learn');
                }}
            >
                <BookSvg className="book-icon" />
            </button>
            <button
                className={`mv-card-save ${isSaved ? "mv-active" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCardStatus(cardId, 'save');
                }}
                style={{ top: '55px', position: 'absolute' }}
            >
                <SaveIcon className="save-icon" />
            </button>
        </div>
    );

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < cards.length - 1;

    return (
        <div
            className="mv-flashcard-area mv-fullscreen"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                margin: 0,
                borderRadius: 0,
                background: 'var(--main_bg_color, #fff)'
            }}
        >
            <button
                className="mv-btn-icon"
                onClick={onClose}
                style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
            >
                <CloseIcon width={30} height={30} />
            </button>

            <div className="mv-flashcard-wrapper">
                <FlipCard
                    frontContent={<>{frontText}{actionIconsOverlay}</>}
                    backContent={<>{backText}{actionIconsOverlay}</>}
                    flipped={flipped}
                    onFlip={() => setFlipped(!flipped)}
                />
            </div>

            <div className="mv-controls-row">
                <div className="mv-card-controls">
                    <button className={`mv-nav-btn ${hasPrev ? "mv-enabled" : ""}`} onClick={handlePrev}>
                        <PrevIcon />
                    </button>
                    <div className="mv-counter">
                        {currentIndex + 1} / {cards.length}
                    </div>
                    <button className={`mv-nav-btn ${hasNext ? "mv-enabled" : ""}`} onClick={handleNext}>
                        <NextIcon />
                    </button>
                </div>

                <div className="mv-icon-controls">
                    <button className="mv-icon-btn" onClick={handleRestart} title="Restart">
                        <RestartIcon />
                    </button>
                    <button className="mv-icon-btn" onClick={() => setAutoplay(!autoplay)} title="Auto">
                        {autoplay ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button className="mv-icon-btn" onClick={onClose} title="Exit Fullscreen">
                        <FullscreenIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}