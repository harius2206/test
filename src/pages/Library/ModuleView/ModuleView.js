import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../../components/button/button";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import Rating from "@mui/material/Rating";
import FlipCard from "../../../components/flipCard/flipCard";
import DiagonalFlag43 from "../../../components/diagonalFlagRect43";
import { useAuth } from "../../../context/AuthContext";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import FullscreenCard from "../../../components/fullscreenCard/fullscreenCard";
import Loader from "../../../components/loader/loader";
import { useI18n } from "../../../i18n";

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
    const { t } = useI18n();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const mvModuleId = searchParams.get("id");
    const mvInitialModule = location.state?.module;

    const [mvModule, mvSetModule] = useState(mvInitialModule || null);
    const [mvLoading, mvSetLoading] = useState(!mvInitialModule || !mvInitialModule.cards);
    const [mvError, mvSetError] = useState(null);

    const [mvCurrentIndex, mvSetCurrentIndex] = useState(0);
    const [mvFlipped, mvSetFlipped] = useState(false);
    const [mvLearned, mvSetLearned] = useState(new Set());
    const [mvSaved, mvSetSaved] = useState(new Set());
    const [mvRating, mvSetRating] = useState(0);

    const [mvAutoplay, mvSetAutoplay] = useState(false);
    const mvAutoplayRef = useRef(null);
    const mvAutoplayInterval = 3000;

    const [mvShowFullscreen, mvSetShowFullscreen] = useState(false);
    const [mvShowPermissions, mvSetShowPermissions] = useState(false);

    useEffect(() => {
        if (!mvModuleId) {
            if (!mvInitialModule) navigate("/library");
            return;
        }

        const mvFetchModule = async () => {
            try {
                mvSetLoading(true);
                const response = await getModuleById(mvModuleId);
                const data = response.data;

                const learnedSet = new Set();
                const savedSet = new Set();

                if (data.cards) {
                    data.cards.forEach(c => {
                        if (c.learned_status === "learned") learnedSet.add(c.id);
                        if (c.saved === true) savedSet.add(c.id);
                    });
                }
                mvSetLearned(learnedSet);
                mvSetSaved(savedSet);

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

                mvSetModule(adaptedModule);
                mvSetRating(Math.round(adaptedModule.rating * 10) / 10);
            } catch (err) {
                console.error("Failed to load module:", err);
                mvSetError(t("mvErrorLoadModule"));
            } finally {
                mvSetLoading(false);
            }
        };
        mvFetchModule();
    }, [mvModuleId, navigate, mvInitialModule, t]);

    const mvCards = mvModule?.cards || [];
    const mvHasPrev = mvCurrentIndex > 0;
    const mvHasNext = mvCurrentIndex < mvCards.length - 1;
    const mvIsOwnModule = user?.username === mvModule?.author;

    const mvHandleUpdateCardStatus = async (cardId, type) => {
        if (type === 'learn') {
            const isCurrentlyLearned = mvLearned.has(cardId);
            mvSetLearned(prev => {
                const next = new Set(prev);
                isCurrentlyLearned ? next.delete(cardId) : next.add(cardId);
                return next;
            });
            try {
                const card = mvCards.find(c => c.id === cardId);
                if (card) {
                    await updateCardLearnStatus(cardId, !isCurrentlyLearned, {
                        original: card.term || "",
                        translation: card.definition || "",
                        learned: "learned"
                    });
                }
            } catch (err) {
                mvSetLearned(prev => {
                    const next = new Set(prev);
                    isCurrentlyLearned ? next.add(cardId) : next.delete(cardId);
                    return next;
                });
            }
        } else if (type === 'save') {
            const isCurrentlySaved = mvSaved.has(cardId);
            mvSetSaved(prev => {
                const next = new Set(prev);
                isCurrentlySaved ? next.delete(cardId) : next.add(cardId);
                return next;
            });
            try {
                if (isCurrentlySaved) await unsaveCard(cardId);
                else await saveCard(cardId);
            } catch (err) {
                mvSetSaved(prev => {
                    const next = new Set(prev);
                    isCurrentlySaved ? next.add(cardId) : next.delete(cardId);
                    return next;
                });
                alert(t("mvFailedAction"));
            }
        }
    };

    const mvToggleCardLearned = (cardId, e) => {
        if (e) e.stopPropagation();
        mvHandleUpdateCardStatus(cardId, 'learn');
    };

    const mvToggleCardSave = (cardId, e) => {
        if (e) e.stopPropagation();
        mvHandleUpdateCardStatus(cardId, 'save');
    };

    const mvHandleDelete = async () => {
        if (!window.confirm(t("mvDeleteModuleConfirm"))) return;
        try {
            await deleteModule(mvModule.id);
            navigate("/library");
        } catch (err) { alert(t("mvDeleteModuleFailed")); }
    };

    const mvHandleRatingChange = async (event, newValue) => {
        if (mvIsOwnModule || newValue === null) return;
        mvSetRating(newValue);
        try { await rateModule(mvModule.id, newValue); } catch (err) { alert(t("mvFailedRate")); }
    };

    const mvHandleAddPermission = async (userObj) => {
        try {
            await addModulePermission(mvModule.id, userObj.id);
            mvSetModule(prev => ({ ...prev, collaborators: [...(prev.collaborators || []), userObj] }));
        } catch (err) { alert(t("mvFailedAction")); }
    };

    const mvHandleRemovePermission = async (userId) => {
        try {
            await removeModulePermission(mvModule.id, userId);
            mvSetModule(prev => ({ ...prev, collaborators: (prev.collaborators || []).filter(u => u.id !== userId) }));
        } catch (err) { alert(t("mvFailedAction")); }
    };

    const mvPrevCard = () => { mvSetCurrentIndex((i) => (i > 0 ? i - 1 : mvCards.length - 1)); mvSetFlipped(false); };
    const mvNextCard = () => { mvSetCurrentIndex((i) => (i < mvCards.length - 1 ? i + 1 : 0)); mvSetFlipped(false); };
    const mvFlipCard = () => mvSetFlipped((v) => !v);

    const mvOpenFullscreen = () => {
        mvSetAutoplay(false);
        mvSetShowFullscreen(true);
    };

    useEffect(() => {
        if (mvAutoplay) {
            mvAutoplayRef.current = setInterval(() => {
                mvSetCurrentIndex((i) => (i < mvCards.length - 1 ? i + 1 : 0));
                mvSetFlipped(false);
            }, mvAutoplayInterval);
        } else {
            clearInterval(mvAutoplayRef.current);
            mvAutoplayRef.current = null;
        }
        return () => clearInterval(mvAutoplayRef.current);
    }, [mvAutoplay, mvCards.length]);

    if (mvLoading) return <Loader fullscreen />;
    if (mvError) return <div className="mv-error">{mvError}</div>;
    if (!mvModule) return null;

    const mvActionIconsOverlay = (cardId) => (
        <div className="card-actions-overlay">
            <button
                className={`mv-card-book ${mvLearned.has(cardId) ? "mv-active" : ""}`}
                onClick={(e) => mvToggleCardLearned(cardId, e)}
            >
                <BookSvg className="book-icon" />
            </button>
            <button
                className={`mv-card-save ${mvSaved.has(cardId) ? "mv-active" : ""}`}
                onClick={(e) => mvToggleCardSave(cardId, e)}
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
                            <h1 className="mv-module-title">{mvModule.topicName ? `${mvModule.name} - ${mvModule.topicName}` : mvModule.name}</h1>
                            {(mvModule.flagFrom || mvModule.flagTo) && <DiagonalFlag43 flag1={mvModule.flagFrom} flag2={mvModule.flagTo} width={40} height={28} />}
                        </div>
                        <div className="mv-module-rating">
                            <Rating
                                name="module-rating"
                                value={mvRating}
                                precision={1}
                                readOnly={mvIsOwnModule}
                                onChange={mvHandleRatingChange}
                                icon={<StarSvg className="mv-star-icon mv-active" />}
                                emptyIcon={<StarSvg className="mv-star-icon" />}
                            />
                        </div>
                    </div>
                    <div className="mv-header-controls">
                        {mvIsOwnModule && (
                            <DropdownMenu align="right" width={180} items={[
                                { label: t("mvEditLabel"), onClick: () => navigate("/library/create-module", { state: { mode: "edit", moduleId: mvModule.id, moduleData: mvModule } }), icon: <EditIcon width={16} /> },
                                { label: t("mvCollaboratorsLabel"), onClick: () => mvSetShowPermissions(true), icon: <ShareIcon width={16} /> },
                                { label: t("mvDeleteLabel"), onClick: mvHandleDelete, icon: <DeleteIcon width={16} /> }
                            ]}>
                                <button className="mv-btn-icon"><DotsIcon width={24} height={24} /></button>
                            </DropdownMenu>
                        )}
                        <button onClick={() => navigate(-1)} className="mv-btn-icon" title={t("mvCloseTitle")}><CloseIcon width={28} height={28} /></button>
                    </div>
                </div>

                <div className="mv-view_tags-row">
                    {(mvModule.tags || []).map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>

                <div className="mv-mv-tabs">
                    <Button variant="toggle" onClick={() => navigate(`/cardscheck?id=${mvModule.id}`, { state: { module: mvModule } })} width="100%" height={42}>{t("ccModuleLabel")}</Button>
                    <Button variant="toggle" onClick={() => navigate(`/cardstest?id=${mvModule.id}`, { state: { module: mvModule } })} width="100%" height={42}>{t("ctModuleDefault")}</Button>
                </div>

                <div className="mv-flashcard-area">
                    <div className="mv-flashcard-wrapper">
                        {mvCards.length > 0 ? (
                            <FlipCard
                                frontContent={<>{mvCards[mvCurrentIndex]?.term}{mvActionIconsOverlay(mvCards[mvCurrentIndex]?.id)}</>}
                                backContent={<>{mvCards[mvCurrentIndex]?.definition}{mvActionIconsOverlay(mvCards[mvCurrentIndex]?.id)}</>}
                                flipped={mvFlipped}
                                onFlip={mvFlipCard}
                            />
                        ) : <div className="mv-empty-cards">{t("mvEmptyMessage")}</div>}
                    </div>

                    {mvCards.length > 0 && (
                        <div className="mv-controls-row">
                            <div className="mv-card-controls">
                                <button className={`mv-nav-btn ${mvHasPrev ? "mv-enabled" : ""}`} onClick={mvHasPrev ? mvPrevCard : undefined}><PrevIcon /></button>
                                <div className="mv-counter">{mvCurrentIndex + 1} / {mvCards.length}</div>
                                <button className={`mv-nav-btn ${mvHasNext ? "mv-enabled" : ""}`} onClick={mvHasNext ? mvNextCard : undefined}><NextIcon /></button>
                            </div>
                            <div className="mv-icon-controls">
                                <button className="mv-icon-btn" onClick={() => mvSetCurrentIndex(0)} title={t("mvRestartTitle")}><RestartIcon /></button>
                                <button className="mv-icon-btn" onClick={() => mvSetAutoplay(v => !v)} title={t("mvAutoTitle")}>{mvAutoplay ? <PauseIcon /> : <PlayIcon />}</button>
                                <button className="mv-icon-btn" onClick={mvOpenFullscreen} title={t("mvFullscreenTitle")}><FullscreenIcon /></button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mv-cards-lists">
                    {["Вивчені", "Ще в процесі"].map(type => {
                        const isLearnedType = type === "Вивчені";
                        const filtered = mvCards.filter(c => isLearnedType ? mvLearned.has(c.id) : !mvLearned.has(c.id));
                        return (
                            <React.Fragment key={type}>
                                <h3>{isLearnedType ? t("mvLearnedTitle") : t("mvInProgressTitle")} ({filtered.length})</h3>
                                {filtered.length === 0 ? <div className="mv-row mv-empty-message">{t("mvEmptyMessage")}</div> :
                                    filtered.map(c => (
                                        <div key={c.id} className="mv-row">
                                            <div className="mv-row-half mv-row-left">{c.term}</div>
                                            <div className="mv-row-divider" />
                                            <div className="mv-row-right">
                                                <span className="mv-row-definition">{c.definition}</span>
                                                <div style={{ display: 'flex', gap: '8px', position: 'absolute', right: '10px', alignItems: 'center' }}>
                                                    <button
                                                        className={`mv-row-book-btn ${mvLearned.has(c.id) ? "mv-active" : ""}`}
                                                        onClick={() => mvToggleCardLearned(c.id)}
                                                        style={{ position: 'static' }}
                                                    >
                                                        <BookSvg className="book-icon" />
                                                    </button>
                                                    <button
                                                        className={`mv-row-save-btn ${mvSaved.has(c.id) ? "mv-active" : ""}`}
                                                        onClick={(e) => mvToggleCardSave(c.id, e)}
                                                        style={{ position: 'static' }}
                                                    >
                                                        <SaveIcon className="save-icon" width="20px" height="20px" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </React.Fragment>
                        );
                    })}
                </div>
            </main>

            {mvShowFullscreen && mvCards.length > 0 && (
                <FullscreenCard
                    cards={mvCards}
                    initialIndex={mvCurrentIndex}
                    onClose={() => mvSetShowFullscreen(false)}
                    onUpdateCardStatus={mvHandleUpdateCardStatus}
                    checkIsLearned={(id) => mvLearned.has(id)}
                    checkIsSaved={(id) => mvSaved.has(id)}
                />
            )}

            {mvShowPermissions && (
                <div className="modal-overlay" onClick={() => mvSetShowPermissions(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div onClick={e => e.stopPropagation()}>
                        <PermissionsMenu moduleId={mvModule.id} users={mvModule.collaborators || []} onAddUser={mvHandleAddPermission} onRemoveUser={mvHandleRemovePermission} onClose={() => mvSetShowPermissions(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}