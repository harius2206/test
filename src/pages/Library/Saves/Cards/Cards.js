import React, { useState, useEffect, useMemo, useCallback } from "react";
import SortMenu from "../../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../../components/dropDownMenu/dropDownMenu";
import { useAuth } from "../../../../context/AuthContext";
import {
    getSavedModules,
    getSavedCardsByModule,
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
    const storageKey = `cardsSort_${source}`;

    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState(() => localStorage.getItem(storageKey) || "newest");

    const loadSavedCards = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const modulesResp = await getSavedModules(user.id);
            const savedModules = modulesResp.data.results || modulesResp.data || [];

            const cardsPromises = savedModules.map(m => getSavedCardsByModule(m.id, user.id));
            const results = await Promise.all(cardsPromises);

            const allSavedCards = results.flatMap((resp, index) => {
                const moduleCards = resp.data.results || resp.data || [];
                return moduleCards.map(c => ({
                    ...c,
                    moduleId: savedModules[index].id,
                    createdAt: c.created_at || new Date().toISOString(),
                    is_saved: true,
                    is_learned: c.learned_status === "learned"
                }));
            });

            setCards(allSavedCards);
        } catch (err) {
            console.error("Failed to load cards", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSavedCards();
    }, [loadSavedCards]);

    useEffect(() => {
        localStorage.setItem(storageKey, sort);
    }, [sort, storageKey]);

    const handleSort = (type) => {
        if (type === "date") setSort("newest");
        else if (type === "date_asc") setSort("oldest");
        else if (type === "name") setSort("title_asc");
        else if (type === "name_desc") setSort("title_desc");
        else setSort(type);
    };

    const sorted = useMemo(() => {
        const copy = [...cards];
        if (sort === "newest") copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        else if (sort === "oldest") copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        else if (sort === "title_asc") copy.sort((a, b) => (a.term || a.original || "").localeCompare(b.term || b.original || ""));
        else if (sort === "title_desc") copy.sort((a, b) => (b.term || b.original || "").localeCompare(a.term || a.original || ""));
        return copy;
    }, [cards, sort]);

    const toggleLearn = async (card) => {
        try {
            const newStatus = !card.is_learned ? "learned" : "in_progress";
            await updateCardLearnStatus(card.moduleId, card.id, newStatus);
            setCards(prev => prev.map(c =>
                c.id === card.id ? { ...c, is_learned: !card.is_learned } : c
            ));
        } catch (err) {
            alert("Помилка оновлення статусу.");
        }
    };

    const toggleSave = async (card, e) => {
        if (e) e.stopPropagation();
        try {
            if (card.is_saved) {
                await unsaveCard(card.moduleId, card.id);
                setCards(prev => prev.filter(c => c.id !== card.id));
            } else {
                await saveCard(card.moduleId, card.id);
                setCards(prev => prev.map(c =>
                    c.id === card.id ? { ...c, is_saved: true } : c
                ));
            }
        } catch (err) {
            alert("Дія не вдалася.");
        }
    };

    if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Завантаження...</div>;

    return (
        <div>
            <div className="library-controls" style={{ alignItems: "center" }}>
                <SortMenu onSort={handleSort} />
            </div>

            <div className="library-content" style={{ marginTop: 12 }}>
                {sorted.length === 0 ? (
                    <div className="mv-row mv-empty-message" style={{ textAlign: "center", padding: "20px" }}>
                        Тут поки порожньо
                    </div>
                ) : (
                    sorted.map((c) => (
                        <div key={c.id} className="mv-row">
                            <div className="mv-row-half mv-row-left">
                                {c.term || c.original}
                            </div>
                            <div className="mv-row-divider" />
                            <div className="mv-row-right">
                                <span className="mv-row-definition">
                                    {c.definition || c.translation}
                                </span>
                                <div style={{ display: 'flex', gap: '8px', position: 'absolute', right: '10px', alignItems: 'center' }}>
                                    <button
                                        className={`mv-row-book-btn ${c.is_learned ? "mv-active" : ""}`}
                                        onClick={() => toggleLearn(c)}
                                        title={c.is_learned ? "Повернути до вивчення" : "Позначити як вивчене"}
                                        style={{ position: 'static' }}
                                    >
                                        <BookSvg className="book-icon" />
                                    </button>

                                    <button
                                        className="mv-row-save-btn"
                                        onClick={(e) => toggleSave(c, e)}
                                        title={c.is_saved ? "Вилучити зі збереженого" : "Зберегти картку"}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginTop: '2px' }}
                                    >
                                        <SaveIcon
                                            className="save-icon"
                                            style={{ color: c.is_saved ? '#a855f7' : 'var(--mv-text-muted)', width: '20px', height: '20px' }}
                                        />
                                    </button>

                                    <DropdownMenu
                                        align="left"
                                        items={[{ label: "На весь екран", icon: <FullscreenIcon width={16} />, onClick: () => { } }]}
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
        </div>
    );
}