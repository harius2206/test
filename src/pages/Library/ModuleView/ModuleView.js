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
            <main className="module-view">
                {/* Header */}
                <div className="module-header-row">
                    <div className="module-left-row">
                        <h1 className="module-title">{module.name}</h1>
                        <div className="module-rating">
                            <Rating
                                name="module-rating"
                                value={rating}
                                precision={1}
                                onChange={(e, newValue) => setRating(newValue)}
                                icon={<StarSvg className="star-icon active" />}
                                emptyIcon={<StarSvg className="star-icon" />}
                            />
                        </div>
                    </div>

                    <div className="header-controls">
                        <DropdownMenu align="left" width={200} items={menuItems}>
                            <button className="btn-icon">
                                <DotsIcon width={18} height={18} />
                            </button>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Tags */}
                <div className="view_tags-row">
                    {(module.tags || []).map((t, i) => (
                        <span key={i} className="tag">{t}</span>
                    ))}
                </div>

                {/* Tabs */}
                <div className="mv-tabs">
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
                        onClick={() => setActiveTab("test")}
                        width="100%"
                        height={42}
                    >
                        Test
                    </Button>
                </div>

                {/* Flashcard */}
                <div className={`flashcard-area ${isFullscreen ? "fullscreen" : ""}`}>
                    <div className="flashcard-wrapper">
                        <FlipCard
                            frontContent={
                                <>
                                    {cards[currentIndex]?.term || "—"}
                                    <button
                                        className={`card-book ${learned.has(cards[currentIndex]?.id) ? "active" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCardLearned(cards[currentIndex]?.id);
                                        }}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(cards[currentIndex]?.id) ? "active" : ""}`} />
                                    </button>
                                </>
                            }
                            backContent={
                                <>
                                    {cards[currentIndex]?.definition || "—"}
                                    <button
                                        className={`card-book ${learned.has(cards[currentIndex]?.id) ? "active" : ""}`}
                                        onClick={(e) => toggleCardLearned(cards[currentIndex]?.id, e)}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(cards[currentIndex]?.id) ? "active" : ""}`} />
                                    </button>
                                </>
                            }
                            flipped={flipped}
                            onFlip={flipCard}
                        />
                    </div>

                    {/* Controls */}
                    <div className="controls-row">
                        <div className="card-controls">
                            <button className={`nav-btn ${hasPrev ? "enabled" : ""}`} onClick={hasPrev ? prevCard : undefined}>
                                <PrevIcon />
                            </button>
                            <div className="counter">{currentIndex + 1} / {cards.length}</div>
                            <button className={`nav-btn ${hasNext ? "enabled" : ""}`} onClick={hasNext ? nextCard : undefined}>
                                <NextIcon />
                            </button>
                        </div>

                        <div className="icon-controls">
                            <button className="icon-btn" onClick={restartDeck} title="Restart">
                                <RestartcreenIcon />
                            </button>
                            <button className="icon-btn" onClick={() => setAutoplay(v => !v)} title="Play/Pause">
                                {autoplay ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <button
                                className="icon-btn"
                                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                onClick={toggleFullscreen}
                            >
                                <FullscreenIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Author */}
                <div className="author-band">
                    <div className="module-view__author-info-row">
                        <UserAvatar name={module.author} size={80} fontSize={34} avatar={module.authorAvatar} />
                        <div className="author-info-block">
                            <div className="author-label">Author</div>
                            <div className="author-name">{module.author}</div>
                            <div className="author-rating-row">
                                <span className="author-rating-value">{rating} / 5</span>
                                <StarSvg className="star-icon active" />
                            </div>
                        </div>
                    </div>
                    <div className="author-description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod urna eu tincidunt.
                    </div>
                </div>

                {/* Learned / Not learned */}
                <div className="cards-lists">
                    <h3>Learned</h3>
                    {cards.filter((c) => learned.has(c.id)).length === 0 && (
                        <div className="row empty-message">No learned cards</div>
                    )}
                    {cards
                        .filter((c) => learned.has(c.id))
                        .map((c) => (
                            <div key={c.id} className="row">
                                <div className="row-half row-left">
                                    {c.term}
                                </div>
                                <div className="row-divider" />
                                <div className="row-right">
                                    <span className="row-definition">{c.definition}</span>
                                    <button
                                        className={`row-book-btn ${learned.has(c.id) ? "active" : ""}`}
                                        onClick={() => toggleCardLearned(c.id)}
                                        title={learned.has(c.id) ? "Unmark learned" : "Mark learned"}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(c.id) ? "active" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        ))}

                    <h3>Not learned</h3>
                    {cards.filter((c) => !learned.has(c.id)).length === 0 && (
                        <div className="row empty-message">All cards learned</div>
                    )}
                    {cards
                        .filter((c) => !learned.has(c.id))
                        .map((c) => (
                            <div key={c.id} className="row">
                                <div className="row-half row-left">
                                    {c.term}
                                </div>
                                <div className="row-divider" />
                                <div className="row-right">
                                    <span className="row-definition">{c.definition}</span>
                                    <button
                                        className={`row-book-btn ${learned.has(c.id) ? "active" : ""}`}
                                        onClick={() => toggleCardLearned(c.id)}
                                        title={learned.has(c.id) ? "Unmark learned" : "Mark learned"}
                                    >
                                        <BookSvg className={`book-icon ${learned.has(c.id) ? "active" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}