// File: src/pages/Library/Modules/Modules.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";

const defaultModules = [
    {
        id: 1,
        name: "Polisz",
        terms: 150,
        author: "admin",
        rating: 4.2,
        tags: ["mgr1", "litery", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa", "slowa"],
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

export default function Modules({ modulesData }) {
    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount, setVisibleCount] = useState(null); // null до обчислення
    const [modules, setModules] = useState(modulesData || defaultModules);
    const [permissionsTarget, setPermissionsTarget] = useState(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Встановлюємо тему одразу
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    // Обчислення видимих тегів
    useEffect(() => {
        const computeVisible = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const baseTagWidth = 80;
                const count = Math.max(3, Math.floor(width / baseTagWidth) - 5);
                setVisibleCount(count);
            }
        };

        computeVisible(); // одразу при монтуванні

        const observer = new ResizeObserver(computeVisible);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const handleSort = (type) => {
        if (type === "date") {
            setModules([...modules].sort((a, b) => b.id - a.id));
        } else if (type === "name") {
            setModules([...modules].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const toggleTags = (id) =>
        setExpandedTags((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleDelete = (id) => {
        setModules((prev) => prev.filter((m) => m.id !== id));
    };

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
        <div className="modules-page" ref={containerRef} style={{ position: "relative" }}>
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

            {/* Рендеримо тільки після обчислення visibleCount */}
            {visibleCount !== null && (
                <div className="module-list">
                    {modules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            visibleCount={visibleCount}
                            expanded={expandedTags[module.id]}
                            toggleTags={toggleTags}
                            onDelete={handleDelete}
                            onPermissions={openModulePermissions}
                            onClick={() =>
                                navigate("/library/module-view", { state: { module } })
                            }
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
