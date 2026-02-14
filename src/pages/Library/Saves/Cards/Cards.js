import React, { useState, useEffect, useMemo, useCallback } from "react";
import SortMenu from "../../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../../components/dropDownMenu/dropDownMenu";
import { useAuth } from "../../../../context/AuthContext";
import { useI18n } from "../../../../i18n";
import FullscreenCard from "../../../../components/fullscreenCard/fullscreenCard";
import Loader from "../../../../components/loader/loader";
import {
    getSavedCards,
    unsaveCard,
    saveCard,
    updateCardLearnStatus
} from "../../../../api/modulesApi";

import { ReactComponent as FullscreenIcon } from "../../../../images/expand.svg";
import { ReactComponent as SaveIcon } from "../../../../images/save.svg";
import { ReactComponent as DotsIcon } from "../../../../images/dots.svg";
import { ReactComponent as BookSvg } from "../../../../images/book.svg";

export default function Cards({ source = "saves" }) {
    const { user } = useAuth();
    const { t } = useI18n();
    const cStorageKey = `cardsSort_${source}`;

    const [cCards, cSetCards] = useState([]);
    const [cLoading, cSetLoading] = useState(true);
    const [cSort, cSetSort] = useState(() => localStorage.getItem(cStorageKey) || "newest");

    // State для fullscreen
    const [cFullscreenStartIndex, cSetFullscreenStartIndex] = useState(null);

    const cLoadSavedCards = useCallback(async () => {
        if (!user?.id) {
            cSetLoading(false);
            return;
        }
        try {
            cSetLoading(true);
            const resp = await getSavedCards(user.id);
            const data = resp.data.results || resp.data || [];

            const mappedCards = data.map(cardItem => ({
                ...cardItem,
                createdAt: cardItem.created_at || new Date().toISOString(),
                is_saved: true,
                is_learned: cardItem.learned_status === "learned"
            }));

            cSetCards(mappedCards);
        } catch (err) {
            console.error("Failed to load saved cards:", err);
        } finally {
            cSetLoading(false);
        }
    }, [user]);

    useEffect(() => {
        cLoadSavedCards();
    }, [cLoadSavedCards]);

    useEffect(() => {
        localStorage.setItem(cStorageKey, cSort);
    }, [cSort, cStorageKey]);

    const cHandleSort = (type) => {
        if (type === "date") cSetSort("newest");
        else if (type === "date_asc") cSetSort("oldest");
        else if (type === "name") cSetSort("title_asc");
        else if (type === "name_desc") cSetSort("title_desc");
        else cSetSort(type);
    };

    const cSorted = useMemo(() => {
        const copy = [...cCards];
        if (cSort === "newest") copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (cSort === "oldest") copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (cSort === "title_asc") copy.sort((a, b) => (a.original || "").localeCompare(b.original || ""));
        else if (cSort === "title_desc") copy.sort((a, b) => (b.original || "").localeCompare(a.original || ""));
        return copy;
    }, [cCards, cSort]);

    const cHandleCardStatusUpdate = async (cardId, type) => {
        const card = cCards.find(c => c.id === cardId);
        if (!card) return;

        if (type === "learn") {
            const newStatus = !card.is_learned;
            // Оптимістичне оновлення UI
            cSetCards(prev => prev.map(c => c.id === cardId ? { ...c, is_learned: newStatus } : c));

            try {
                await updateCardLearnStatus(cardId, newStatus, {
                    original: card.original || "",
                    translation: card.translation || "",
                    learned: "learned"
                });
            } catch (err) {
                // Відкат при помилці
                cSetCards(prev => prev.map(c => c.id === cardId ? { ...c, is_learned: !newStatus } : c));
                console.error(err);
                alert(t("cErrorLearnUpdate"));
            }
        } else if (type === "save") {
            const wasSaved = card.is_saved;
            // Оптимістично видаляємо зі списку збережених, якщо натиснули unsave
            if (wasSaved) {
                cSetCards(prev => prev.filter(c => c.id !== cardId));
            }

            try {
                if (wasSaved) {
                    await unsaveCard(cardId);
                } else {
                    await saveCard(cardId);
                    cSetCards(prev => prev.map(c => c.id === cardId ? { ...c, is_saved: true } : c));
                }
            } catch (err) {
                // Відкат (повертаємо картку в список)
                if (wasSaved) cLoadSavedCards();
                alert(t("cErrorActionFailed"));
            }
        }
    };

    if (cLoading) return <Loader />;

    return (
        <div>
            <div className="library-controls" style={{ alignItems: "center" }}>
                <SortMenu onSort={cHandleSort} />
            </div>

            <div className="library-content" style={{ marginTop: 12 }}>
                {cSorted.length === 0 ? (
                    <div className="mv-row mv-empty-message" style={{ textAlign: "center", padding: "20px" }}>
                        {t("cEmptyCardsMessage")}
                    </div>
                ) : (
                    cSorted.map((c, index) => (
                        <div key={c.id} className="mv-row">
                            <div className="mv-row-half mv-row-left">
                                {c.original}
                            </div>
                            <div className="mv-row-divider" />
                            <div className="mv-row-right">
                                <span className="mv-row-definition">
                                    {c.translation}
                                </span>
                                <div style={{ display: 'flex', gap: '8px', position: 'absolute', right: '10px', alignItems: 'center' }}>
                                    <button
                                        className={`mv-row-book-btn ${c.is_learned ? "mv-active" : ""}`}
                                        onClick={(e) => { e.stopPropagation(); cHandleCardStatusUpdate(c.id, 'learn'); }}
                                        style={{ position: 'static' }}
                                    >
                                        <BookSvg className="book-icon" />
                                    </button>

                                    <button
                                        className={`mv-row-save-btn ${c.is_saved ? "mv-active" : ""}`}
                                        onClick={(e) => { e.stopPropagation(); cHandleCardStatusUpdate(c.id, 'save'); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginTop: '2px' }}
                                    >
                                        <SaveIcon
                                            className="save-icon"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    </button>

                                    <DropdownMenu
                                        align="left"
                                        items={[{
                                            label: t("cFullscreenLabel"),
                                            icon: <FullscreenIcon width={16} />,
                                            onClick: () => cSetFullscreenStartIndex(index)
                                        }]}
                                    >
                                        <button className="mv-btn-icon">
                                            <DotsIcon width={20} />
                                        </button>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cFullscreenStartIndex !== null && cSorted.length > 0 && (
                <FullscreenCard
                    cards={cSorted}
                    initialIndex={cFullscreenStartIndex}
                    onClose={() => cSetFullscreenStartIndex(null)}
                    onUpdateCardStatus={cHandleCardStatusUpdate}
                    checkIsLearned={(id) => cCards.find(x => x.id === id)?.is_learned}
                    checkIsSaved={(id) => cCards.find(x => x.id === id)?.is_saved}
                />
            )}
        </div>
    );
}