import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/usersApi";
import { deleteModule } from "../../../api/modulesApi";
import { addModuleToFolder } from "../../../api/foldersApi";
import { useAuth } from "../../../context/AuthContext";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import ColoredIcon from "../../../components/coloredIcon";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";

import { ReactComponent as FolderIcon } from "../../../images/folder.svg";

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
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount, setVisibleCount] = useState(3);
    const [permissionsTarget, setPermissionsTarget] = useState(null);
    const [sortType, setSortType] = useState("date");

    const [addToFolderTarget, setAddToFolderTarget] = useState(null);

    const [modalInfo, setModalInfo] = useState({
        open: false,
        type: "info",
        title: "",
        message: ""
    });

    const handleCloseModal = () => {
        setModalInfo((prev) => ({ ...prev, open: false }));
    };

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
            const response = await getUserDetails(user.id);

            const userModules = response.data.modules || [];
            const mappedModules = userModules.map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: { username: user.username, avatar: user.avatar },
                topic: m.topic,
                cards_count: m.cards ? m.cards.length : (m.cards_count || 0)
            }));
            setModules(mappedModules);

            const userFolders = response.data.folders || [];
            setFolders(userFolders);

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

    // --- ResizeObserver (оновлено) ---
    // Додано залежність [loading], щоб observer підключався після рендеру контенту
    useEffect(() => {
        if (loading) return; // Якщо ще вантажиться, реф не готовий

        const element = containerRef.current;
        if (!element) return;

        const computeVisible = () => {
            const width = element.offsetWidth;
            const count = Math.max(3, Math.floor(width / 80) - 5);
            setVisibleCount(count);
        };

        computeVisible();
        const observer = new ResizeObserver(computeVisible);
        observer.observe(element);

        return () => observer.disconnect();
    }, [loading]);

    // --- Сортування ---
    const handleSort = (type) => {
        setSortType(type);
        setModules(prev => {
            const sorted = [...prev];
            if (type === "name") {
                sorted.sort((a, b) => a.name.localeCompare(b.name));
            } else {
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
            setModalInfo({
                open: true,
                type: "error",
                title: "Error",
                message: "Failed to delete module. Please try again."
            });
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

    // --- Додавання до папки ---
    const openAddToFolderMenu = (module, evt, trigger) => {
        let anchor = null;
        if (trigger && trigger.getBoundingClientRect) {
            const rect = trigger.getBoundingClientRect();
            anchor = { left: rect.left - 100, top: rect.bottom + 5 };
        }
        setAddToFolderTarget({ module, anchor });
    };

    const handleAddToFolder = async (folder) => {
        if (!addToFolderTarget) return;
        const { module } = addToFolderTarget;

        try {
            await addModuleToFolder(folder.id, module.id);
            setModalInfo({
                open: true,
                type: "success",
                title: "Added",
                message: `Added "${module.name}" to folder "${folder.name}"`
            });
        } catch (err) {
            console.error("Add to folder failed", err);
            setModalInfo({
                open: true,
                type: "error",
                title: "Error",
                message: "Could not add to folder. It might already be there."
            });
        } finally {
            setAddToFolderTarget(null);
        }
    };

    // [FIX] Early return при завантаженні (як у Folders.js)
    if (loading) {
        return <div style={{ padding: 20, textAlign: "center" }}>Loading library...</div>;
    }

    return (
        <div className="modules-page" ref={containerRef} style={{ position: "relative", minHeight: "200px" }}>
            <div className="library-controls" style={{ display: "flex", justifyContent: "space-between" }}>
                <SortMenu onSort={handleSort} />
            </div>

            {error ? (
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
                            onAddToFolder={openAddToFolderMenu}
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

            {addToFolderTarget && (
                <>
                    <div
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 301 }}
                        onClick={() => setAddToFolderTarget(null)}
                    />
                    <div
                        className="dropdown-menu"
                        style={{
                            position: "fixed",
                            left: addToFolderTarget.anchor?.left || "50%",
                            top: addToFolderTarget.anchor?.top || "50%",
                            zIndex: 302,
                            background: "white",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            padding: "8px 0",
                            minWidth: "200px",
                            maxHeight: "300px",
                            overflowY: "auto"
                        }}
                    >
                        <div style={{ padding: "8px 16px", fontWeight: "bold", borderBottom: "1px solid #eee", fontSize: "14px", color: "#666" }}>
                            Add "{addToFolderTarget.module.name}" to:
                        </div>
                        {folders.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", color: "gray", fontSize: "13px" }}>
                                No folders found.
                            </div>
                        ) : (
                            folders.map(folder => (
                                <div
                                    key={folder.id}
                                    onClick={() => handleAddToFolder(folder)}
                                    style={{
                                        padding: "10px 16px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f7"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <ColoredIcon icon={FolderIcon} color={folder.color || "#6366f1"} size={18} />
                                    <span style={{ fontSize: "14px", color: "#333" }}>{folder.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            <ModalMessage
                open={modalInfo.open}
                type={modalInfo.type}
                title={modalInfo.title}
                message={modalInfo.message}
                onClose={handleCloseModal}
            />
        </div>
    );
}