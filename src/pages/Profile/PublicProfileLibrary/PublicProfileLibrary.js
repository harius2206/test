import React, { useState, useRef, useEffect } from "react";
import UserAvatar from "../../../components/avatar/avatar";
import SortMenu from "../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";

import { ReactComponent as StarIcon } from "../../../images/star.svg";
import { ReactComponent as PinIcon } from "../../../images/pin.svg";
import { ReactComponent as SaveIcon } from "../../../images/save.svg";
import { ReactComponent as AddIcon } from "../../../images/add.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as FolderIcon } from "../../../images/folder.svg";

import "./publicProfileLibrary.css";

export default function PublicProfileLibrary() {
    const [activeTab, setActiveTab] = useState("modules");
    const [sortOption, setSortOption] = useState("date");
    const [underlineStyle, setUnderlineStyle] = useState({});
    const tabsRef = useRef([]);

    const user = {
        name: "Admin",
        rating: 4.2,
        created: "15.05.2030",
        avatar: "",
        folders: 15,
        modules: 8,
        words: 2500,
    };

    const baseModules = [
        {
            id: 1,
            name: "Polisz",
            terms: 150,
            rating: 4.2,
            tags: ["vocab", "letters", "words", "common"],
            date: "2025-09-10",
        },
        {
            id: 2,
            name: "Aolisz 2.0",
            terms: 360,
            rating: 3.4,
            tags: ["letters", "words"],
            date: "2025-08-25",
        },
    ];

    const baseFolders = [
        { id: 1, name: "Polisz", color: "#b91c1c", modules: 15, date: "2025-09-20" },
        { id: 2, name: "Polisz 2.0", color: "#9333ea", modules: 0, date: "2025-09-01" },
    ];

    // --- handle sorting
    const handleSort = (option) => {
        setSortOption(option);
    };

    const sortedModules = [...baseModules].sort((a, b) => {
        if (sortOption === "name") return a.name.localeCompare(b.name);
        if (sortOption === "date") return new Date(b.date) - new Date(a.date);
        return 0;
    });

    const sortedFolders = [...baseFolders].sort((a, b) => {
        if (sortOption === "name") return a.name.localeCompare(b.name);
        if (sortOption === "date") return new Date(b.date) - new Date(a.date);
        return 0;
    });

    // underline animation for tabs
    useEffect(() => {
        const activeIndex = activeTab === "modules" ? 0 : 1;
        const el = tabsRef.current[activeIndex];
        if (el) {
            const { offsetLeft, offsetWidth } = el;
            setUnderlineStyle({
                left: offsetLeft,
                width: offsetWidth,
            });
        }
    }, [activeTab]);

    return (
        <div className="ppl-wrapper">
            {/* Header */}
            <div className="ppl-header">
                <div className="ppl-avatar-section">
                    <UserAvatar name={user.name} avatar={user.avatar} size={110} />
                    <p className="ppl-created">created: {user.created}</p>
                </div>

                <div className="ppl-info">
                    <h2 className="ppl-name">
                        {user.name}
                        <span className="ppl-rating">
              {user.rating}/5 <StarIcon width={16} height={16} />
            </span>
                    </h2>

                    <p className="ppl-description">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum, ex.
                    </p>

                    <div className="ppl-stats-column">
                        <p>folders: {user.folders}</p>
                        <p>modules: {user.modules}</p>
                        <p>words: {user.words}</p>
                    </div>
                </div>
            </div>

            <h3 className="ppl-library-title">{user.name}’s library</h3>

            {/* Tabs */}
            <div className="ppl-tabs">
                <button
                    ref={(el) => (tabsRef.current[0] = el)}
                    className={activeTab === "modules" ? "active" : ""}
                    onClick={() => setActiveTab("modules")}
                >
                    Modules
                </button>
                <button
                    ref={(el) => (tabsRef.current[1] = el)}
                    className={activeTab === "folders" ? "active" : ""}
                    onClick={() => setActiveTab("folders")}
                >
                    Folders
                </button>
                <div className="ppl-underline" style={underlineStyle}></div>
            </div>

            {/* Sort row */}
            <div className="ppl-sort-row">
                <SortMenu onSort={handleSort} />
            </div>

            {/* Content */}
            <div className="ppl-content">
                {activeTab === "modules" ? (
                    <div className="module-list ppl-modules">
                        {sortedModules.map((m) => (
                            <div key={m.id} className="module-card">
                                <div className="module-info">
                                    <div className="top-row">
                                        <span className="terms-count">{m.terms} terms</span>
                                        <span className="rating">
                      {m.rating}/5 <StarIcon className="star-icon" />
                    </span>
                                        <div className="tags-row">
                                            {m.tags.map((tag, i) => (
                                                <span key={i} className="tag">
                          {tag}
                        </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="module-name-row">
                                        <span className="module-name-text">{m.name}</span>
                                    </div>
                                </div>

                                <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu
                                        align="right"
                                        width={180}
                                        items={[
                                            { label: "Add to library", icon: <AddIcon width={15} height={15} /> },
                                            { label: "Pin", icon: <PinIcon width={15} height={15} /> },
                                            { label: "Save", icon: <SaveIcon width={15} height={15} /> },
                                        ]}
                                    >
                                        <button className="btn-icon">
                                            <DotsIcon width={16} height={16} />
                                        </button>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="module-list ppl-folders">
                        {sortedFolders.map((f) => (
                            <div key={f.id} className="module-card">
                                <div className="module-info">
                                    <div className="top-row">
                                        <span className="terms-count">{f.modules} modules</span>
                                    </div>
                                    <div
                                        className="module-name-row"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginTop: 6,
                                        }}
                                    >
                                        <FolderIcon width={20} height={20} fill={f.color || "#6366f1"} />
                                        <span className="module-name-text">{f.name}</span>
                                    </div>
                                </div>

                                <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu
                                        align="right"
                                        width={140}
                                        items={[{ label: "Pin", icon: <PinIcon width={15} height={15} /> }]}
                                    >
                                        <button className="btn-icon">
                                            <DotsIcon width={16} height={16} />
                                        </button>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
