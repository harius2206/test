// javascript
import React, { useState, useEffect, useMemo } from "react";
import SortMenu from "../../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../../components/dropDownMenu/dropDownMenu";
import { ReactComponent as FullscreenIcon } from "../../../../images/expand.svg";
import { ReactComponent as SaveIcon } from "../../../../images/save.svg";
import { ReactComponent as DotsIcon } from "../../../../images/dots.svg";

export default function Cards({ source = "default", cards: propCards = null }) {
    const storageKey = `cardsSort_${source}`;
    const [sort, setSort] = useState(() => localStorage.getItem(storageKey) || "newest");

    useEffect(() => {
        localStorage.setItem(storageKey, sort);
    }, [storageKey, sort]);

    const initialCards = propCards || [
        { id: 1, term: "one", definition: "один", createdAt: "2025-01-02" },
        { id: 2, term: "two", definition: "два", createdAt: "2024-12-20" },
        { id: 3, term: "three", definition: "три", createdAt: "2025-02-10" },
    ];

    const handleSort = (type) => {
        if (type === "date") setSort("newest");
        else if (type === "date_asc") setSort("oldest");
        else if (type === "name") setSort("title_asc");
        else if (type === "name_desc") setSort("title_desc");
        else setSort(type);
    };

    const sorted = useMemo(() => {
        const copy = [...initialCards];
        if (sort === "newest") {
            copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sort === "oldest") {
            copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sort === "title_asc") {
            copy.sort((a, b) => a.term.localeCompare(b.term));
        } else if (sort === "title_desc") {
            copy.sort((a, b) => b.term.localeCompare(a.term));
        }
        return copy;
    }, [initialCards, sort]);

    const handleFullscreen = (card, e) => {
        if (e) e.stopPropagation();
        alert(`Fullscreen card: ${card.term}`);
    };

    const handleUnsave = (cardId, e) => {
        if (e) e.stopPropagation();
        alert(`Unsave card ${cardId}`);
    };

    return (
        <div>
            <div className="library-controls" style={{ alignItems: "center" }}>
                <SortMenu onSort={handleSort} />
                <div />{/* spacer */}
            </div>

            <div className="library-content" style={{ marginTop: 12 }}>
                {sorted.length === 0 && <div className="mv-row mv-empty-message" style={{ color: "var(--lib-muted)" }}>No cards</div>}

                {sorted.map((c) => {
                    const menuItems = [
                        {
                            label: "Fullscreen",
                            icon: <FullscreenIcon width={20} height={20} />,
                            onClick: (e) => handleFullscreen(c, e),
                        },
                        {
                            label: "Unsave",
                            icon: <SaveIcon width={20} height={20} />,
                            onClick: (e) => handleUnsave(c.id, e),
                        },
                    ];

                    return (
                        <div
                            key={c.id}
                            className="mv-row"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 0",
                                borderBottom: "1px solid var(--lib-border)"
                            }}
                        >
                            <div className="mv-row-half mv-row-left" style={{ flex: 1 }}>
                                {c.term}
                            </div>

                            <div className="mv-row-divider" style={{ width: 1, height: 24, background: "var(--lib-border)", margin: "0 12px" }} />

                            <div className="mv-row-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span className="mv-row-definition" style={{ color: "var(--lib-muted)" }}>{c.definition}</span>

                                <DropdownMenu align="left" width={240} items={menuItems} >
                                    <button
                                        className="mv-btn-icon"
                                        type="button"
                                        title="More"
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6 }}
                                    >
                                        <DotsIcon width={20} height={20} />
                                    </button>
                                </DropdownMenu>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}