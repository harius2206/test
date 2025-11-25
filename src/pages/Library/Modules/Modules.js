import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/usersApi";
import { deleteModule } from "../../../api/modulesApi";
import { useAuth } from "../../../context/AuthContext";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";

// Хелпер для виправлення URL картинок (прапорів)
const getFlagUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

export default function Modules({ source = "library" }) {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { user } = useAuth();

    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount, setVisibleCount] = useState(3);
    const [permissionsTarget, setPermissionsTarget] = useState(null);
    const [sortType, setSortType] = useState("date");

    // --- Завантаження даних ---
    const loadData = useCallback(async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }

        if (source === "saves") {
            setModules([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Витягуємо модулі з профілю юзера: /api/v1/users/{id}/
            const response = await getUserDetails(user.id);
            const userModules = response.data.modules || [];

            const mappedModules = userModules.map(m => ({
                ...m,
                // Мапимо рейтинг з avg_rate в rating (для ModuleCard)
                rating: m.avg_rate,
                // Мапимо прапори і додаємо повний URL
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                // ModuleCard очікує об'єкт user
                user: { username: user.username, avatar: user.avatar },
                // Тема (topic) тут приходить як об'єкт {id, name}, ModuleCard це обробить
                topic: m.topic
            }));

            setModules(mappedModules);
            setError(null);
        } catch (err) {
            console.error("Failed to load library", err);
            setError("Failed to load your modules.");
        } finally {
            setLoading(false);
        }
    }, [user, source]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Логіка тегів (ResizeObserver) ---
    useEffect(() => {
        const computeVisible = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const count = Math.max(3, Math.floor(width / 80) - 5);
                setVisibleCount(count);
            }
        };
        computeVisible();
        const observer = new ResizeObserver(computeVisible);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // --- Сортування ---
    const handleSort = (type) => {
        setSortType(type);
        setModules(prev => {
            const sorted = [...prev];
            if (type === "name") {
                sorted.sort((a, b) => a.name.localeCompare(b.name));
            } else {
                // Сортування за ID (як proxy для дати створення)
                sorted.sort((a, b) => b.id - a.id);
            }
            return sorted;
        });
    };

    // --- Видалення ---
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this module?")) return;
        try {
            await deleteModule(id);
            setModules(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete module.");
        }
    };

    const toggleTags = (id) =>
        setExpandedTags(prev => ({ ...prev, [id]: !prev[id] }));

    const openModulePermissions = (module, evt, trigger) => {
        let anchor = null;
        if (trigger && trigger.getBoundingClientRect) {
            const rect = trigger.getBoundingClientRect();
            anchor = { left: rect.left, top: rect.bottom };
        }
        setPermissionsTarget({ moduleId: module.id, users: [], anchor });
    };

    return (
        <div className="modules-page" ref={containerRef} style={{ position: "relative", minHeight: "200px" }}>
            <div className="library-controls" style={{ display: "flex", justifyContent: "space-between" }}>
                <SortMenu onSort={handleSort} />
            </div>

            {loading ? (
                <div style={{ padding: 20, textAlign: "center" }}>Loading library...</div>
            ) : error ? (
                <div style={{ padding: 20, color: "red", textAlign: "center" }}>{error}</div>
            ) : modules.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "gray" }}>
                    You don't have any modules yet.
                </div>
            ) : (
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
                        />
                    ))}
                </div>
            )}

            {permissionsTarget && (
                <div style={{
                    position: "fixed",
                    left: permissionsTarget.anchor?.left,
                    top: permissionsTarget.anchor?.top,
                    zIndex: 300
                }}>
                    <PermissionsMenu onClose={() => setPermissionsTarget(null)} />
                </div>
            )}
        </div>
    );
}