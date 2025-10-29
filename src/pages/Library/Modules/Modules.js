// File: src/pages/Library/Modules/Modules.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";

const libraryModules = [
    {
        id: 1,
        name: "Polisz",
        terms: 150,
        author: "admin",
        rating: 4.2,
        tags: [
            "mgr1",
            "litery",
            "slowa",
            "exam",
            "verbs",
            "grammar",
            "words",
            "school"
        ],
        users: [{ id: 1, name: "admin", avatar: "", role: "Edit" }],
        cards: [
            { id: 1, term: "kot", definition: "cat" },
            { id: 2, term: "pies", definition: "dog" }
        ]
    },
    {
        id: 2,
        name: "Angielski",
        terms: 200,
        author: "adam",
        rating: 3.8,
        tags: ["eng", "words"],
        users: [],
        cards: [
            { id: 1, term: "house", definition: "будинок" },
            { id: 2, term: "car", definition: "авто" }
        ]
    }
];

const savedModules = [
    {
        id: 101,
        name: "Saved - History",
        terms: 180,
        author: "John",
        rating: 4.9,
        tags: ["dates", "wars", "figures"],
        users: [],
        cards: [{ id: 1, term: "WW2", definition: "1939–1945" }]
    },
    {
        id: 102,
        name: "Saved - Chemistry",
        terms: 120,
        author: "Nina",
        rating: 4.7,
        tags: ["atoms", "reactions", "science"],
        users: [],
        cards: [{ id: 1, term: "H2O", definition: "Water" }]
    }
];

export default function Modules({ modulesData, source = "library" }) {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // --- визначаємо з яких даних брати модулі ---
    const [modules, setModules] = useState(
        modulesData || (source === "saves" ? savedModules : libraryModules)
    );

    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount, setVisibleCount] = useState(null);
    const [permissionsTarget, setPermissionsTarget] = useState(null);

    // --- тема ---
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    // --- обчислення кількості видимих тегів ---
    useEffect(() => {
        const computeVisible = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const baseTagWidth = 80;
                const count = Math.max(3, Math.floor(width / baseTagWidth) - 5);
                setVisibleCount(count);
            }
        };
        computeVisible();
        const observer = new ResizeObserver(computeVisible);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // --- сортування ---
    const handleSort = (type) => {
        if (source === "saves") return; // у сейвах не сортуємо
        if (type === "date") {
            setModules([...modules].sort((a, b) => b.id - a.id));
        } else if (type === "name") {
            setModules([...modules].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    // --- теги ---
    const toggleTags = (id) =>
        setExpandedTags((prev) => ({ ...prev, [id]: !prev[id] }));

    // --- видалення ---
    const handleDelete = (id) => {
        if (source === "saves") return; // у сейвах не видаляємо
        if (!window.confirm("Delete this module?")) return;
        setModules((prev) => prev.filter((m) => m.id !== id));
    };

    // --- permissions ---
    const closePermissions = () => setPermissionsTarget(null);

    const openModulePermissions = (module, evt, trigger) => {
        let anchor = null;
        if (trigger && typeof trigger.getBoundingClientRect === "function") {
            const rect = trigger.getBoundingClientRect();
            anchor = { left: rect.left, top: rect.bottom };
        } else if (evt && (evt.clientX !== undefined || evt.clientY !== undefined)) {
            anchor = { left: evt.clientX, top: evt.clientY };
        }

        setPermissionsTarget({
            moduleId: module.id,
            users: module.users || [],
            anchor
        });
    };

    return (
        <div
            className="modules-page"
            ref={containerRef}
            style={{ position: "relative" }}
        >
            <div
                className="library-controls"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <SortMenu onSort={handleSort} />
            </div>

            {visibleCount !== null && (
                <div className="module-list">
                    {modules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            visibleCount={visibleCount}
                            expanded={expandedTags[module.id]}
                            toggleTags={toggleTags}
                            onDelete={() => handleDelete(module.id)}
                            onPermissions={openModulePermissions}
                            onClick={() => {
                                if (source === "saves") {
                                    navigate("/saves/module-view", {
                                        state: { module }
                                    });
                                } else {
                                    navigate("/library/module-view", {
                                        state: { module }
                                    });
                                }
                            }}
                        />
                    ))}
                </div>
            )}

            {permissionsTarget && (
                <div
                    style={{
                        position: "fixed",
                        left: permissionsTarget.anchor
                            ? permissionsTarget.anchor.left
                            : undefined,
                        top: permissionsTarget.anchor
                            ? permissionsTarget.anchor.top
                            : 64,
                        right: permissionsTarget.anchor ? undefined : 12,
                        zIndex: 300
                    }}
                >
                    <PermissionsMenu
                        users={permissionsTarget.users}
                        onClose={closePermissions}
                    />
                </div>
            )}
        </div>
    );
}
