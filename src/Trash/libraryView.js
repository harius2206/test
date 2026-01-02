import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../../components/button/button";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import UserAvatar from "../../../components/avatar/avatar";
import Rating from "@mui/material/Rating";
import FlipCard from "../../../components/flipCard/flipCard";
import DiagonalFlag43 from "../../../components/diagonalFlagRect43";
import { useAuth } from "../../../context/AuthContext";
// 1. Імпорт PermissionsMenu
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
// 2. Імпорт API методів
import {
    getModuleById, deleteModule, rateModule, updateCardLearnStatus,
    addModulePermission, removeModulePermission
} from "../../../api/modulesApi";

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
import { ReactComponent as RestartIcon } from "../../../images/restart.svg";
import { ReactComponent as BookSvg } from "../../../images/book.svg";

import "./moduleView.css";

const getFlagUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

export default function ModuleView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const moduleId = searchParams.get("id");
    const initialModule = location.state?.module;

    const [module, setModule] = useState(initialModule || null);
    const [loading, setLoading] = useState(!initialModule || !initialModule.cards);
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [learned, setLearned] = useState(new Set());
    const [rating, setRating] = useState(0);
    const [autoplay, setAutoplay] = useState(false);
    const autoplayRef = useRef(null);
    const autoplayInterval = 3000;
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 3. Стейт для відкриття меню пермішенів
    const [showPermissions, setShowPermissions] = useState(false);

    useEffect(() => {
        if (!moduleId) {
            if (!initialModule) navigate("/library");
            return;
        }

        const fetchModule = async () => {
            try {
                setLoading(true);
                const response = await getModuleById(moduleId);
                const data = response.data;

                const learnedSet = new Set();
                if (data.cards) {
                    data.cards.forEach(c => {
                        if (c.learned_status === "learned") learnedSet.add(c.id);
                    });
                }
                setLearned(learnedSet);

                const adaptedModule = {
                    ...data,
                    cards: data.cards ? data.cards.map(c => ({
                        ...c,
                        term: c.original,
                        definition: c.translation
                    })) : [],
                    author: data.user?.username || "Unknown",
                    authorAvatar: data.user?.avatar,
                    topicName: typeof data.topic === 'object' ? data.topic?.name : data.topic,
                    flagFrom: getFlagUrl(data.lang_from?.flag),
                    flagTo: getFlagUrl(data.lang_to?.flag),
                    rating: data.user_rate ? parseFloat(data.user_rate) : 0,
                    // Переконаємось, що collaborators - це масив
                    collaborators: data.collaborators || []
                };

                setModule(adaptedModule);
                setRating(Math.round(adaptedModule.rating * 10) / 10);
            } catch (err) {
                console.error("Failed to load module", err);
                setError("Failed to load module.");
            } finally {
                setLoading(false);
            }
        };

        fetchModule();
    }, [moduleId, navigate, initialModule]);

    const cards = module?.cards || [];
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < cards.length - 1;
    const isOwnModule = user?.username === module?.author;

    const handleDelete = async () => {
        if (!window.confirm("Delete module?")) return;
        try {
            await deleteModule(module.id);
            navigate("/library");
        } catch (err) {
            alert("Failed to delete module.");
        }
    };

    const handleRatingChange = async (event, newValue) => {
        if (isOwnModule || newValue === null) return;
        setRating(newValue);
        try {
            await rateModule(module.id, newValue);
        } catch (err) { alert("Failed to submit rating."); }
    };

    const toggleCardLearned = async (cardId, e) => {
        if (e) e.stopPropagation();
        const isCurrentlyLearned = learned.has(cardId);
        const newStatus = isCurrentlyLearned ? "in_progress" : "learned";

        setLearned((prev) => {
            const next = new Set(prev);
            if (isCurrentlyLearned) next.delete(cardId);
            else next.add(cardId);
            return next;
        });

        try {
            await updateCardLearnStatus(module.id, cardId, newStatus);
        } catch (err) {
            setLearned((prev) => {
                const next = new Set(prev);
                if (isCurrentlyLearned) next.add(cardId);
                else next.delete(cardId);
                return next;
            });
        }
    };

    // --- Permissions Logic ---
    const handleAddPermission = async (userObj) => {
        try {
            await addModulePermission(module.id, userObj.id);
            setModule(prev => ({
                ...prev,
                collaborators: [...(prev.collaborators || []), userObj]
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to add user permission");
        }
    };

    const handleRemovePermission = async (userId) => {
        try {
            await removeModulePermission(module.id, userId);
            setModule(prev => ({
                ...prev,
                collaborators: (prev.collaborators || []).filter(u => u.id !== userId)
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to remove permission");
        }
    };

    const menuItems = [
        {
            label: "Edit",
            onClick: () => navigate("/library/create-module", { state: { mode: "edit", moduleId: module.id, moduleData: module } }),
            icon: <EditIcon width={16} height={16} />,
        },
        {
            label: "Delete",
            onClick: handleDelete,
            icon: <DeleteIcon width={16} height={16} />
        },
        // 4. Оновлений пункт Permissions
        {
            label: "Permissions",
            onClick: () => setShowPermissions(true),
            icon: <ShareIcon width={16} height={16} />
        },
    ];

    const prevCard = () => { setCurrentIndex((i) => (i > 0 ? i - 1 : cards.length - 1)); setFlipped(false); };
    const nextCard = () => { setCurrentIndex((i) => (i < cards.length - 1 ? i + 1 : 0)); setFlipped(false); };
    const restartDeck = () => { setCurrentIndex(0); setFlipped(false); };
    const flipCard = () => setFlipped((v) => !v);
    const toggleFullscreen = () => setIsFullscreen((v) => !v);

    useEffect(() => {
        document.body.style.overflow = isFullscreen ? "hidden" : "";
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

    if (loading) return <div className="mv-loading">Loading module...</div>;
    if (error) return <div className="mv-error">{error}</div>;
    if (!module) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
            <main className="mv-module-view">
                <div className="mv-module-header-row">
                    <div className="mv-module-left-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h1 className="mv-module-title">
                                {module.topicName ? `${module.name} - ${module.topicName}` : module.name}
                            </h1>
                            {(module.flagFrom || module.flagTo) && (
                                <DiagonalFlag43 flag1={module.flagFrom} flag2={module.flagTo} width={40} height={28} />
                            )}
                        </div>
                        <div className="mv-module-rating">
                            <Rating
                                name="module-rating"
                                value={rating}
                                precision={0.5}
                                readOnly={isOwnModule}
                                onChange={handleRatingChange}
                                icon={<StarSvg className="mv-star-icon mv-active" />}
                                emptyIcon={<StarSvg className="mv-star-icon" />}
                            />
                        </div>
                    </div>

                    <div className="mv-header-controls">
                        {isOwnModule && (
                            <DropdownMenu align="left" width={200} items={menuItems}>
                                <button className="mv-btn-icon"><DotsIcon width={18} height={18} /></button>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <div className="mv-view_tags-row">
                    {(module.tags || []).map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>

                <div className="mv-mv-tabs">
                    <Button variant="toggle" onClick={() => navigate(`/cardscheck?id=${module.id}`, { state: { module } })} width="100%" height={42}>Cards</Button>
                    <Button variant="toggle" onClick={() => navigate(`/cardstest?id=${module.id}`, { state: { module } })} width="100%" height={42}>Test</Button>
                </div>

                <div className={`mv-flashcard-area ${isFullscreen ? "mv-fullscreen" : ""}`}>
                    {/* ... (рендер карток без змін) ... */}
                    <div className="mv-flashcard-wrapper">
                        {cards.length > 0 ? (
                            <FlipCard
                                frontContent={
                                    <>
                                        {cards[currentIndex]?.term || "—"}
                                        <div className="card-actions-overlay">
                                            <button className={`mv-card-book ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`} onClick={(e) => toggleCardLearned(cards[currentIndex]?.id, e)}>
                                                <BookSvg className={`book-icon ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`} />
                                            </button>
                                        </div>
                                    </>
                                }
                                backContent={
                                    <>
                                        {cards[currentIndex]?.definition || "—"}
                                        <div className="card-actions-overlay">
                                            <button className={`mv-card-book ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`} onClick={(e) => toggleCardLearned(cards[currentIndex]?.id, e)}>
                                                <BookSvg className={`book-icon ${learned.has(cards[currentIndex]?.id) ? "mv-active" : ""}`} />
                                            </button>
                                        </div>
                                    </>
                                }
                                flipped={flipped}
                                onFlip={flipCard}
                            />
                        ) : <div className="mv-empty-cards">No cards available</div>}
                    </div>
                    {/* ... (контроли карток без змін) ... */}
                    {cards.length > 0 && (
                        <div className="mv-controls-row">
                            <div className="mv-card-controls">
                                <button className={`mv-nav-btn ${hasPrev ? "mv-enabled" : ""}`} onClick={hasPrev ? prevCard : undefined}><PrevIcon /></button>
                                <div className="mv-counter">{currentIndex + 1} / {cards.length}</div>
                                <button className={`mv-nav-btn ${hasNext ? "mv-enabled" : ""}`} onClick={hasNext ? nextCard : undefined}><NextIcon /></button>
                            </div>
                            <div className="mv-icon-controls">
                                <button className="mv-icon-btn" onClick={restartDeck} title="Restart"><RestartIcon /></button>
                                <button className="mv-icon-btn" onClick={() => setAutoplay(v => !v)} title="Play/Pause">{autoplay ? <PauseIcon /> : <PlayIcon />}</button>
                                <button className="mv-icon-btn" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}><FullscreenIcon /></button>
                            </div>
                        </div>
                    )}
                </div>

                {!isOwnModule && (
                    <div className="mv-author-band">
                        {/* ... (Інформація про автора без змін) ... */}
                        <div className="mv-module-view__author-info-row">
                            <UserAvatar name={module.author} size={80} fontSize={34} avatar={module.authorAvatar} />
                            <div className="mv-author-info-block">
                                <div className="mv-author-label">Author</div>
                                <div className="mv-author-name">{module.author}</div>
                                {rating >= 0 && (
                                    <div className="mv-author-rating-row">
                                        <span className="mv-author-rating-value">{rating} / 5</span>
                                        <StarSvg className="mv-star-icon mv-active" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {module.description && <p className="mv-author-description">{module.description}</p>}
                    </div>
                )}

                {/* ... (список learned/not learned без змін) ... */}
                <div className="mv-cards-lists">
                    {/* (код рендеру списків карток тут...) */}
                    <h3>Learned ({cards.filter(c => learned.has(c.id)).length})</h3>
                    {cards.filter((c) => learned.has(c.id)).length === 0 ? <div className="mv-row mv-empty-message">No learned cards yet</div> :
                        cards.filter((c) => learned.has(c.id)).map((c) => (
                            <div key={c.id} className="mv-row">
                                <div className="mv-row-half mv-row-left">{c.term}</div>
                                <div className="mv-row-divider" />
                                <div className="mv-row-right">
                                    <span className="mv-row-definition">{c.definition}</span>
                                    <button className="mv-row-book-btn mv-active" onClick={() => toggleCardLearned(c.id)} title="Unmark learned">
                                        <BookSvg className="book-icon mv-active" />
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                    <h3>Not learned ({cards.filter(c => !learned.has(c.id)).length})</h3>
                    {cards.filter((c) => !learned.has(c.id)).length === 0 ? <div className="mv-row mv-empty-message">All cards learned!</div> :
                        cards.filter((c) => !learned.has(c.id)).map((c) => (
                            <div key={c.id} className="mv-row">
                                <div className="mv-row-half mv-row-left">{c.term}</div>
                                <div className="mv-row-divider" />
                                <div className="mv-row-right">
                                    <span className="mv-row-definition">{c.definition}</span>
                                    <button className="mv-row-book-btn" onClick={() => toggleCardLearned(c.id)} title="Mark learned">
                                        <BookSvg className="book-icon" />
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </main>

            {/* 5. Відображення модалки дозволів */}
            {showPermissions && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }} onClick={() => setShowPermissions(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <PermissionsMenu
                            users={module.collaborators || []}
                            onAddUser={handleAddPermission}
                            onRemoveUser={handleRemovePermission}
                            onClose={() => setShowPermissions(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}