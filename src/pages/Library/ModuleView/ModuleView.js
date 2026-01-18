import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../../components/button/button";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import UserAvatar from "../../../components/avatar/avatar";
import Rating from "@mui/material/Rating";
import FlipCard from "../../../components/flipCard/flipCard";
import DiagonalFlag43 from "../../../components/diagonalFlagRect43";
import { useAuth } from "../../../context/AuthContext";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";

// Імпорт API методів
import {
    getModuleById,
    deleteModule,
    rateModule,
    updateCardLearnStatus,
    addModulePermission,
    removeModulePermission,
    saveCard,
    unsaveCard
} from "../../../api/modulesApi";

// Імпорт іконок
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
import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as SaveIcon } from "../../../images/save.svg";

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
    const [saved, setSaved] = useState(new Set());
    const [rating, setRating] = useState(0);
    const [autoplay, setAutoplay] = useState(false);
    const autoplayRef = useRef(null);
    const autoplayInterval = 3000;
    const [isFullscreen, setIsFullscreen] = useState(false);
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
                const savedSet = new Set();

                if (data.cards) {
                    data.cards.forEach(c => {
                        if (c.learned_status === "learned") learnedSet.add(c.id);
                        // ВИПРАВЛЕНО: Читаємо стан збереження з поля "saved"
                        if (c.saved === true) savedSet.add(c.id);
                    });
                }
                setLearned(learnedSet);
                setSaved(savedSet);

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
                    collaborators: data.collaborators || []
                };

                setModule(adaptedModule);
                setRating(Math.round(adaptedModule.rating * 10) / 10);
            } catch (err) {
                console.error("Failed to load module:", err);
                setError("Не вдалося завантажити модуль.");
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

    const toggleCardLearned = async (cardId, e) => {
        if (e) e.stopPropagation();
        const isCurrentlyLearned = learned.has(cardId);

        // Оновлюємо UI миттєво (optimistic update)
        setLearned(prev => {
            const next = new Set(prev);
            isCurrentlyLearned ? next.delete(cardId) : next.add(cardId);
            return next;
        });

        try {
            // Новий API: статус тепер передається як boolean (або обробляється всередині api)
            await updateCardLearnStatus(cardId, !isCurrentlyLearned);
        } catch (err) {
            // Відкат стану при помилці
            setLearned(prev => {
                const next = new Set(prev);
                isCurrentlyLearned ? next.add(cardId) : next.delete(cardId);
                return next;
            });
        }
    };

    const toggleCardSave = async (cardId, e) => {
        if (e) e.stopPropagation();
        const isCurrentlySaved = saved.has(cardId);

        setSaved(prev => {
            const next = new Set(prev);
            isCurrentlySaved ? next.delete(cardId) : next.add(cardId);
            return next;
        });

        try {
            if (isCurrentlySaved) {
                await unsaveCard(cardId);
            } else {
                await saveCard(cardId);
            }
        } catch (err) {
            setSaved(prev => {
                const next = new Set(prev);
                isCurrentlySaved ? next.add(cardId) : next.delete(cardId);
                return next;
            });
            alert("Дія не вдалася.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Видалити цей модуль?")) return;
        try {
            await deleteModule(module.id);
            navigate("/library");
        } catch (err) { alert("Failed to delete."); }
    };

    const handleRatingChange = async (event, newValue) => {
        if (isOwnModule || newValue === null) return;
        setRating(newValue);
        try { await rateModule(module.id, newValue); } catch (err) { alert("Failed to rate."); }
    };

    const handleAddPermission = async (userObj) => {
        try {
            await addModulePermission(module.id, userObj.id);
            setModule(prev => ({ ...prev, collaborators: [...(prev.collaborators || []), userObj] }));
        } catch (err) { alert("Failed to add permission."); }
    };

    const handleRemovePermission = async (userId) => {
        try {
            await removeModulePermission(module.id, userId);
            setModule(prev => ({ ...prev, collaborators: (prev.collaborators || []).filter(u => u.id !== userId) }));
        } catch (err) { alert("Failed to remove permission."); }
    };

    const prevCard = () => { setCurrentIndex((i) => (i > 0 ? i - 1 : cards.length - 1)); setFlipped(false); };
    const nextCard = () => { setCurrentIndex((i) => (i < cards.length - 1 ? i + 1 : 0)); setFlipped(false); };
    const flipCard = () => setFlipped((v) => !v);
    const toggleFullscreen = () => setIsFullscreen((v) => !v);

    useEffect(() => {
        if (isFullscreen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
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

    if (loading) return <div className="mv-loading">Завантаження...</div>;
    if (error) return <div className="mv-error">{error}</div>;
    if (!module) return null;

    const actionIconsOverlay = (cardId) => (
        <div className="card-actions-overlay">
            <button
                className={`mv-card-book ${learned.has(cardId) ? "mv-active" : ""}`}
                onClick={(e) => toggleCardLearned(cardId, e)}
            >
                <BookSvg className="book-icon" />
            </button>
            <button
                className={`mv-card-save ${saved.has(cardId) ? "mv-active" : ""}`}
                onClick={(e) => toggleCardSave(cardId, e)}
                style={{ top: '55px', position: 'absolute' }}
            >
                <SaveIcon className="save-icon" />
            </button>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
            <main className="mv-module-view">
                <div className="mv-module-header-row">
                    <div className="mv-module-left-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h1 className="mv-module-title">{module.topicName ? `${module.name} - ${module.topicName}` : module.name}</h1>
                            {(module.flagFrom || module.flagTo) && <DiagonalFlag43 flag1={module.flagFrom} flag2={module.flagTo} width={40} height={28} />}
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
                            <DropdownMenu align="right" width={180} items={[
                                { label: "Редагувати", onClick: () => navigate("/library/create-module", { state: { mode: "edit", moduleId: module.id, moduleData: module } }), icon: <EditIcon width={16} /> },
                                { label: "Співавтори", onClick: () => setShowPermissions(true), icon: <ShareIcon width={16} /> },
                                { label: "Видалити", onClick: handleDelete, icon: <DeleteIcon width={16} /> }
                            ]}>
                                <button className="mv-btn-icon"><DotsIcon width={24} height={24} /></button>
                            </DropdownMenu>
                        )}
                        <button onClick={() => navigate(-1)} className="mv-btn-icon" title="Закрити"><CloseIcon width={28} height={28} /></button>
                    </div>
                </div>

                <div className="mv-view_tags-row">
                    {(module.tags || []).map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>

                <div className="mv-mv-tabs">
                    <Button variant="toggle" onClick={() => navigate(`/cardscheck?id=${module.id}`, { state: { module } })} width="100%" height={42}>Картки</Button>
                    <Button variant="toggle" onClick={() => navigate(`/cardstest?id=${module.id}`, { state: { module } })} width="100%" height={42}>Тест</Button>
                </div>

                <div className={`mv-flashcard-area ${isFullscreen ? "mv-fullscreen" : ""}`}>
                    <div className="mv-flashcard-wrapper">
                        {cards.length > 0 ? (
                            <FlipCard
                                frontContent={<>{cards[currentIndex]?.term}{actionIconsOverlay(cards[currentIndex]?.id)}</>}
                                backContent={<>{cards[currentIndex]?.definition}{actionIconsOverlay(cards[currentIndex]?.id)}</>}
                                flipped={flipped}
                                onFlip={flipCard}
                            />
                        ) : <div className="mv-empty-cards">Тут порожньо</div>}
                    </div>

                    {cards.length > 0 && (
                        <div className="mv-controls-row">
                            <div className="mv-card-controls">
                                <button className={`mv-nav-btn ${hasPrev ? "mv-enabled" : ""}`} onClick={hasPrev ? prevCard : undefined}><PrevIcon /></button>
                                <div className="mv-counter">{currentIndex + 1} / {cards.length}</div>
                                <button className={`mv-nav-btn ${hasNext ? "mv-enabled" : ""}`} onClick={hasNext ? nextCard : undefined}><NextIcon /></button>
                            </div>
                            <div className="mv-icon-controls">
                                <button className="mv-icon-btn" onClick={() => setCurrentIndex(0)} title="Restart"><RestartIcon /></button>
                                <button className="mv-icon-btn" onClick={() => setAutoplay(v => !v)} title="Auto">{autoplay ? <PauseIcon /> : <PlayIcon />}</button>
                                <button className="mv-icon-btn" onClick={toggleFullscreen} title="Fullscreen"><FullscreenIcon /></button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mv-cards-lists">
                    {["Вивчені", "Ще в процесі"].map(type => {
                        const isLearnedType = type === "Вивчені";
                        const filtered = cards.filter(c => isLearnedType ? learned.has(c.id) : !learned.has(c.id));
                        return (
                            <React.Fragment key={type}>
                                <h3>{type} ({filtered.length})</h3>
                                {filtered.length === 0 ? <div className="mv-row mv-empty-message">Тут порожньо</div> :
                                    filtered.map(c => (
                                        <div key={c.id} className="mv-row">
                                            <div className="mv-row-half mv-row-left">{c.term}</div>
                                            <div className="mv-row-divider" />
                                            <div className="mv-row-right">
                                                <span className="mv-row-definition">{c.definition}</span>
                                                <div style={{ display: 'flex', gap: '8px', position: 'absolute', right: '10px', alignItems: 'center' }}>
                                                    <button
                                                        className={`mv-row-book-btn ${learned.has(c.id) ? "mv-active" : ""}`}
                                                        onClick={() => toggleCardLearned(c.id)}
                                                        style={{ position: 'static' }}
                                                    >
                                                        <BookSvg className="book-icon" />
                                                    </button>
                                                    {/* Кнопка сейва у списку: додано клас mv-active для підсвітки */}
                                                    <button
                                                        className={`mv-row-save-btn ${saved.has(c.id) ? "mv-active" : ""}`}
                                                        onClick={(e) => toggleCardSave(c.id, e)}
                                                        style={{ position: 'static' }}
                                                    >
                                                        <SaveIcon className="save-icon" width="20px" height="20px" />
                                                    </button>
                                                    <DropdownMenu align="left" items={[{ label: "На весь екран", icon: <FullscreenIcon width={16} />, onClick: () => { } }]} >
                                                        <button className="mv-btn-icon"><DotsIcon width={20} /></button>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </React.Fragment>
                        );
                    })}
                </div>
            </main>

            {showPermissions && (
                <div className="modal-overlay" onClick={() => setShowPermissions(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div onClick={e => e.stopPropagation()}>
                        <PermissionsMenu moduleId={module.id} users={module.collaborators || []} onAddUser={handleAddPermission} onRemoveUser={handleRemovePermission} onClose={() => setShowPermissions(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}