import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/usersApi";
// Імпорт необхідних функцій, включаючи mergeModules та getTopics
import {
    deleteModule,
    addModulePermission,
    removeModulePermission,
    mergeModules,
    getTopics
} from "../../../api/modulesApi";
import { addModuleToFolder } from "../../../api/foldersApi";
import { useAuth } from "../../../context/AuthContext";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import ColoredIcon from "../../../components/coloredIcon";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";

import { ReactComponent as FolderIcon } from "../../../images/folder.svg";

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
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount, setVisibleCount] = useState(3);

    const [permissionsTarget, setPermissionsTarget] = useState(null);
    const [sortType, setSortType] = useState("date");
    const [addToFolderTarget, setAddToFolderTarget] = useState(null);
    const [modalInfo, setModalInfo] = useState({ open: false, type: "info", title: "", message: "" });

    // === СТАН ДЛЯ РЕЖИМУ ЗЛИТТЯ ===
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [selectedForMerge, setSelectedForMerge] = useState([]);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [mergeForm, setMergeForm] = useState({ name: "", topic: "" });

    const handleCloseModal = () => setModalInfo((prev) => ({ ...prev, open: false }));

    const loadData = useCallback(async () => {
        if (!user || !user.id) { setLoading(false); return; }
        if (source === "saves") { setModules([]); setLoading(false); return; }

        try {
            setLoading(true);
            const [userResp, topicsResp] = await Promise.all([
                getUserDetails(user.id),
                getTopics()
            ]);

            const userModules = userResp.data.modules || [];
            const mappedModules = userModules.map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: { username: user.username, avatar: user.avatar },
                topic: m.topic,
                cards_count: m.cards ? m.cards.length : (m.cards_count || 0),
                collaborators: m.collaborators || []
            }));

            setModules(mappedModules);
            setFolders(userResp.data.folders || []);
            setTopics(topicsResp.data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to load library", err);
            setError("Failed to load your modules.");
        } finally {
            setLoading(false);
        }
    }, [user, source]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (loading) return;
        const computeVisible = () => {
            if (containerRef.current) {
                const count = Math.max(3, Math.floor(containerRef.current.offsetWidth / 80) - 5);
                setVisibleCount(count);
            }
        };
        computeVisible();
        const obs = new ResizeObserver(computeVisible);
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [loading]);

    // === ЛОГІКА ЗЛИТТЯ ===

    // Викликається при виборі "Merge" в меню картки
    const handleMergeMenuClick = (module) => {
        if (!isMergeMode) {
            setIsMergeMode(true);
            setSelectedForMerge([module]);
        } else {
            // Якщо режим вже активний, просто додаємо/видаляємо цей модуль
            toggleModuleSelection(module);
        }
    };

    // Обробник вибору модулів кліком по картці
    const toggleModuleSelection = (module) => {
        setSelectedForMerge(prev => {
            const isSelected = prev.some(m => m.id === module.id);
            if (isSelected) {
                return prev.filter(m => m.id !== module.id);
            } else {
                return [...prev, module];
            }
        });
    };

    const handleConfirmMerge = async () => {
        if (selectedForMerge.length < 2) return;

        // Значення за замовчуванням для форми
        setMergeForm({
            name: `Merged Module (${selectedForMerge.length})`,
            topic: selectedForMerge[0].topic?.id || selectedForMerge[0].topic || ""
        });
        setIsMergeModalOpen(true);
    };

    const executeMerge = async () => {
        if (!mergeForm.name || !mergeForm.topic) {
            alert("Будь ласка, вкажіть назву та тему");
            return;
        }
        try {
            const payload = {
                name: mergeForm.name,
                topic: parseInt(mergeForm.topic),
                modules: selectedForMerge.map(m => m.id)
            };
            await mergeModules(payload);

            setModalInfo({
                open: true,
                type: "success",
                title: "Успіх",
                message: "Модулі успішно об'єднано!"
            });

            // Скидання стану
            setIsMergeMode(false);
            setSelectedForMerge([]);
            setIsMergeModalOpen(false);
            loadData();
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Помилка", message: "Не вдалося об'єднати модулі." });
        }
    };

    const cancelMergeMode = () => {
        setIsMergeMode(false);
        setSelectedForMerge([]);
    };

    // --- Actions ---

    const handleSort = (type) => {
        setSortType(type);
        setModules(prev => {
            const sorted = [...prev];
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            else sorted.sort((a, b) => b.id - a.id);
            return sorted;
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this module?")) return;
        try {
            await deleteModule(id);
            setModules(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to delete module." });
        }
    };

    const openModulePermissions = (module, evt, trigger) => {
        let anchor = null;
        if (trigger?.getBoundingClientRect) {
            const rect = trigger.getBoundingClientRect();
            anchor = { left: rect.left, top: rect.bottom };
        }
        setPermissionsTarget({ moduleId: module.id, users: module.collaborators || [], anchor });
    };

    const openAddToFolderMenu = (module, evt, trigger) => {
        let anchor = null;
        if (trigger?.getBoundingClientRect) {
            const rect = trigger.getBoundingClientRect();
            anchor = { left: rect.left - 100, top: rect.bottom + 5 };
        }
        setAddToFolderTarget({ module, anchor });
    };

    const handleAddToFolder = async (folder) => {
        if (!addToFolderTarget) return;
        try {
            await addModuleToFolder(folder.id, addToFolderTarget.module.id);
            setModalInfo({ open: true, type: "success", title: "Додано", message: "Модуль додано до папки" });
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Помилка", message: "Не вдалося додати до папки" });
        } finally {
            setAddToFolderTarget(null);
        }
    };

    if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading library...</div>;

    return (
        <div className="modules-page" ref={containerRef} style={{ position: "relative", minHeight: "200px" }}>

            {/* Панель керування злиттям */}
            {isMergeMode && (
                <div style={{
                    position: "sticky", top: 10, zIndex: 100, background: "#6366f1", color: "white",
                    padding: "12px 20px", borderRadius: "12px", marginBottom: "20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
                }}>
                    <div>
                        <strong>Режим злиття:</strong> Вибрано модулів: {selectedForMerge.length}.
                        <span style={{ marginLeft: 10, fontSize: "13px" }}>Натискайте на картки, щоб вибрати.</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={handleConfirmMerge}
                            disabled={selectedForMerge.length < 2}
                            style={{
                                padding: "6px 15px", borderRadius: "8px", border: "none", cursor: "pointer",
                                fontWeight: "bold", opacity: selectedForMerge.length < 2 ? 0.6 : 1
                            }}
                        >
                            Далі
                        </button>
                        <button
                            onClick={cancelMergeMode}
                            style={{ background: "transparent", color: "white", border: "1px solid white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            )}

            <div className="library-controls" style={{ display: "flex", justifyContent: "space-between" }}>
                <SortMenu onSort={handleSort} />
            </div>

            {error ? (
                <div style={{ padding: 20, color: "red", textAlign: "center" }}>{error}</div>
            ) : modules.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "gray" }}>You don't have any modules yet.</div>
            ) : (
                <div className="module-list">
                    {modules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            visibleCount={visibleCount}
                            expanded={expandedTags[module.id]}
                            toggleTags={(id) => setExpandedTags(prev => ({...prev, [id]: !prev[id]}))}

                            onEdit={() => navigate("/library/create-module", { state: { mode: "edit", moduleId: module.id, moduleData: module } })}
                            onDelete={() => handleDelete(module.id)}
                            onPermissions={openModulePermissions}
                            onAddToFolder={openAddToFolderMenu}

                            // === Пропси для злиття ===
                            onMerge={handleMergeMenuClick}
                            isMergeMode={isMergeMode}
                            isSelected={selectedForMerge.some(m => m.id === module.id)}
                            onSelect={toggleModuleSelection}
                        />
                    ))}
                </div>
            )}

            {/* Модальне вікно налаштування нового модуля */}
            {isMergeModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <h2 style={{ marginBottom: "20px" }}>Злиття модулів</h2>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }}>Назва нового модуля</label>
                            <input
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                                type="text"
                                value={mergeForm.name}
                                onChange={(e) => setMergeForm({...mergeForm, name: e.target.value})}
                            />
                        </div>
                        <div style={{ marginBottom: "25px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }}>Тема</label>
                            <select
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                                value={mergeForm.topic}
                                onChange={(e) => setMergeForm({...mergeForm, topic: e.target.value})}
                            >
                                <option value="">Оберіть тему...</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setIsMergeModalOpen(false)} style={{ padding: "10px 20px", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                Назад
                            </button>
                            <button onClick={executeMerge} style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                                Об'єднати
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Допоміжні меню (права доступу, папки) */}
            {permissionsTarget && (
                <div style={{ position: "fixed", left: permissionsTarget.anchor?.left, top: permissionsTarget.anchor?.top, zIndex: 300 }}>
                    <PermissionsMenu
                        moduleId={permissionsTarget.moduleId}
                        users={permissionsTarget.users}
                        onAddUser={async (u) => { await addModulePermission(permissionsTarget.moduleId, u.id); loadData(); }}
                        onRemoveUser={async (uid) => { await removeModulePermission(permissionsTarget.moduleId, uid); loadData(); }}
                        onClose={() => setPermissionsTarget(null)}
                    />
                </div>
            )}

            {addToFolderTarget && (
                <>
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 301 }} onClick={() => setAddToFolderTarget(null)} />
                    <div className="dropdown-menu" style={{
                        position: "fixed", left: addToFolderTarget.anchor?.left || "50%", top: addToFolderTarget.anchor?.top || "50%",
                        zIndex: 302, background: "white", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        padding: "8px 0", minWidth: "200px", maxHeight: "300px", overflowY: "auto"
                    }}>
                        <div style={{ padding: "8px 16px", fontWeight: "bold", borderBottom: "1px solid #eee", fontSize: "14px", color: "#666" }}>
                            Додати "{addToFolderTarget.module.name}" до:
                        </div>
                        {folders.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", color: "gray", fontSize: "13px" }}>Папок не знайдено.</div>
                        ) : (
                            folders.map(folder => (
                                <div key={folder.id} onClick={() => handleAddToFolder(folder)}
                                     style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.2s" }}
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