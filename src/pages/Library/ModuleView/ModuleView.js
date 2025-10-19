import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/button/button";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import UserAvatar from "../../../components/avatar/avatar";
import Rating from "@mui/material/Rating";
import FlipCard from "../../../components/flipCard/flipCard";

import { ReactComponent as StarSvg } from "../../../images/star.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as EditIcon } from "../../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as ShareIcon } from "../../../images/share.svg";
import { ReactComponent as PlayIcon } from "../../../images/play.svg";
import { ReactComponent as PauseIcon } from "../../../images/pause.svg";
import { ReactComponent as FullscreenIcon } from "../../../images/expand.svg";
import { ReactComponent as PrevIcon } from "../../../images/arrowLeft.svg";
import { ReactComponent as NextIcon } from "../../../images/arrowRight.svg";
import { ReactComponent as RestartcreenIcon } from "../../../images/restart.svg";
import { ReactComponent as BookSvg } from "../../../images/book.svg";

import "./moduleView.css";

export default function ModuleView() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const module = state?.module || {
        id: 1,
        name: "Sample module",
        description: "Short description",
        tags: ["sample", "demo", "vocab"],
        cards: [
            { id: 1, term: "one", definition: "один" },
            { id: 2, term: "two", definition: "два" },
            { id: 3, term: "three", definition: "три" },
        ],
        author: "Admin",
        rating: 4.2,
    };

    const [activeTab, setActiveTab] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [learned, setLearned] = useState(new Set());
    const [rating, setRating] = useState(Math.round((module.rating || 0) * 10) / 10);
    const [autoplay, setAutoplay] = useState(false);
    const autoplayRef = useRef(null);
    const autoplayInterval = 3000;
    const [isFullscreen, setIsFullscreen] = useState(false);

    const cards = module.cards || [];

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < cards.length - 1;

    const menuItems = [
        {
            label: "Edit",
            onClick: () =>
                navigate("/library/create-module", {
                    state: { mode: "edit", module },
                }),
            icon: <EditIcon width={16} height={16} />,
        },
        {
            label: "Delete",
            onClick: () => {
                if (window.confirm("Delete module?")) navigate(-1);
            },
            icon: <DeleteIcon width={16} height={16} />,
        },
        {
            label: "Permissions",
            onClick: () => alert("Permissions menu placeholder"),
            icon: <ShareIcon width={16} height={16} />,
        },
    ];

    const prevCard = () => {
        setCurrentIndex((i) => (i > 0 ? i - 1 : cards.length - 1));
        setFlipped(false);
    };
    const nextCard = () => {
        setCurrentIndex((i) => (i < cards.length - 1 ? i + 1 : 0));
        setFlipped(false);
    };
    const restartDeck = () => {
        setCurrentIndex(0);
        setFlipped(false);
    };
    const flipCard = () => setFlipped((v) => !v);

    const toggleCardLearned = (cardId, e) => {
        if (e) e.stopPropagation();
        setLearned((prev) => {
            const next = new Set(prev);
            next.has(cardId) ? next.delete(cardId) : next.add(cardId);
            return next;
        });
    };

    const toggleFullscreen = () => setIsFullscreen((v) => !v);

    // 🔒 блокування скролу при fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => (document.body.style.overflow = "");
    }, [isFullscreen]);

    useEffect(() => {
        if (autoplay) {
            autoplayRef.current = setInterval(() => {
                setCurrentIndex((i) => (i < cards.length - 1 ? i + 1 : 0));
                setFlipped(false);
            }, autoplayInterval);
        } else {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
        return () => clearInterval(autoplayRef.current);
    }, [autoplay, cards.length]);

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <main className="mv-module-view">
                <div className="mv-module-header-row">
                    <div className="mv-module-left-row">
                        <h1 className="mv-module-title">{module.name}</h1>
                        <div className="mv-module-rating">
                            <Rating
                                name="module-rating"
                                value={rating}
                                precision={1}
                                onChange={(e, newValue) => setRating(newValue)}
                                icon={<StarSvg className="mv-star-icon mv-active" />}
                                emptyIcon={<StarSvg className="mv-star-icon" />}
                            />
                        </div>
                    </div>

                    <div className="mv-header-controls">
                        <DropdownMenu align="left" width={200} items={menuItems}>
                            <button className="mv-btn-icon">
                                <DotsIcon width={18} height={18} />
                            </button>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mv-view_tags-row">
                    {(module.tags || []).map((t, i) => (
                        <span key={i} className="tag">{t}</span>
                    ))}
                </div>

                {/* Tabs */}
                <div className="mv-mv-tabs">
                    <Button
                        variant="toggle"
                        onClick={() => navigate("/cardscheck", { state: { module } })}
                        width="100%"
                        height={42}
                    >
                        Cards
                    </Button>
                    <Button
                        variant="toggle"
                        onClick={() => navigate("/cardstest", { state: { module } })}
                        width="100%"
                        height={42}
                    >
                        Test
                    </Button>
                </div>

                {/* Flashcard */}
                <div className={`mv-flashcard-area ${isFullscreen ? "mv-fullscreen" : ""}`}>
                    <div className="mv-flashcard-wrapper">
                        <FlipCard
                            frontContent={
                                <>
                                    {cards[currentIndex]?.term || "—"}
                                    <button
                                        className={`mv-card-book ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCardLearned(cards[currentIndex]?.id);
                                        }}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`} />
                                    </button>
                                </>
                            }
                            backContent={
                                <>
                                    {cards[currentIndex]?.definition || "—"}
                                    <button
                                        className={`mv-card-book ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`}
                                        onClick={(e) => toggleCardLearned(cards[currentIndex]?.id, e)}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`} />
                                    </button>
                                </>
                            }
                            flipped={flipped}
                            onFlip={flipCard}
                        />
                    </div>

                    {/* Controls */}
                    <div className="mv-controls-row">
                        <div className="mv-card-controls">
                            <button className={`mv-nav-btn ${hasPrev ? "mv-enabled" : ""}`} onClick={hasPrev ? prevCard : undefined}>
                                <PrevIcon />
                            </button>
                            <div className="mv-counter">{currentIndex + 1} / {cards.length}</div>
                            <button className={`mv-nav-btn ${hasNext ? "mv-enabled" : ""}`} onClick={hasNext ? nextCard : undefined}>
                                <NextIcon />
                            </button>
                        </div>

                        <div className="mv-icon-controls">
                            <button className="mv-icon-btn" onClick={restartDeck} title="Restart">
                                <RestartcreenIcon />
                            </button>
                            <button className="mv-icon-btn" onClick={() => setAutoplay(v => !v)} title="Play/Pause">
                                {autoplay ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button
                                className="mv-icon-btn"
                                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                onClick={toggleFullscreen}
                            >
                                <FullscreenIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Author */}
                <div className="mv-author-band">
                    <div className="mv-module-view__author-info-row">
                        <UserAvatar name={module.author} size={80} fontSize={34} avatar={module.authorAvatar} />
                        <div className="mv-author-info-block">
                            <div className="mv-author-label">Author</div>
                            <div className="mv-author-name">{module.author}</div>
                            <div className="mv-author-rating-row">
                                <span className="mv-author-rating-value">{rating} / 5</span>
                                <StarSvg className="mv-star-icon mv-active" />
                            </div>
                        </div>
                    </div>
                    <div className="mv-author-description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod urna eu tincidunt.
                    </div>
                </div>

                {/* Learned / Not learned */}
                <div className="mv-cards-lists">
                    <h3>Learned</h3>
                    {cards.filter((c) => learned.has(c.id)).length === 0 && (
                        <div className="mv-row mv-empty-message">No learned cards</div>
                    )}
                    {cards
                        .filter((c) => learned.has(c.id))
                        .map((c) => (
                            <div key={c.id} className="mv-row">
                                <div className="mv-row-half mv-row-left">
                                    {c.term}
                                </div>
                                <div className="mv-row-divider" />
                                <div className="mv-row-right">
                                    <span className="mv-row-definition">{c.definition}</span>
                                    <button
                                        className={`mv-row-book-btn ${learned.has(c.id) ? "mv-active" : ""}`}
                                        onClick={() => toggleCardLearned(c.id)}
                                        title={learned.has(c.id) ? "Unmark learned" : "Mark learned"}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(c.id) ? "mv-active" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        ))}

                    <h3>Not learned</h3>
                    {cards.filter((c) => !learned.has(c.id)).length === 0 && (
                        <div className="mv-row mv-empty-message">All cards learned</div>
                    )}
                    {cards
                        .filter((c) => !learned.has(c.id))
                        .map((c) => (
                            <div key={c.id} className="mv-row">
                                <div className="mv-row-half mv-row-left">
                                    {c.term}
                                </div>
                                <div className="mv-row-divider" />
                                <div className="mv-row-right">
                                    <span className="mv-row-definition">{c.definition}</span>
                                    <button
                                        className={`mv-row-book-btn ${learned.has(c.id) ? "mv-active" : ""}`}
                                        onClick={() => toggleCardLearned(c.id)}
                                        title={learned.has(c.id) ? "Unmark learned" : "Mark learned"}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(c.id) ? "mv-active" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}