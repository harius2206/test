import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/usersApi";
import {
    deleteModule,
    addModulePermission,
    removeModulePermission,
    getTopics,
    getSavedModules,
    saveModule,
    unsaveModule
} from "../../../api/modulesApi";
import { addModuleToFolder } from "../../../api/foldersApi";
import { useAuth } from "../../../context/AuthContext";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import ColoredIcon from "../../../components/coloredIcon";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";

import { ReactComponent as FolderIcon } from "../../../images/folder.svg";
import { useMergeModules } from "../../../hooks/useMergeModules";

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

    const handleCloseModal = () => setModalInfo((prev) => ({ ...prev, open: false }));

    const loadData = useCallback(async () => {
        if (!user || !user.id) { setLoading(false); return; }

        try {
            setLoading(true);
            let userModules = [];

            if (source === "saves") {
                const savedResp = await getSavedModules(user.id);
                userModules = savedResp.data.results || savedResp.data || [];
            } else {
                const userResp = await getUserDetails(user.id);
                userModules = userResp.data.modules || [];
                setFolders(userResp.data.folders || []);
            }

            const topicsResp = await getTopics();

            const mappedModules = userModules.map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: m.user || { username: user.username, avatar: user.avatar },
                topic: m.topic,
                cards_count: m.cards ? m.cards.length : (m.cards_count || 0),
                collaborators: m.collaborators || [],
                is_saved: source === "saves" ? true : m.is_saved
            }));

            setModules(mappedModules);
            setTopics(topicsResp.data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to load modules", err);
            setError("Failed to load your modules.");
        } finally {
            setLoading(false);
        }
    }, [user, source]);

    useEffect(() => { loadData(); }, [loadData]);

    const merge = useMergeModules(loadData);

    useEffect(() => {
        if (loading) return;
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

    const handleSort = (type) => {
        setSortType(type);
        setModules(prev => {
            const sorted = [...prev];
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            else sorted.sort((a, b) => b.id - a.id);
            return sorted;
        });
    };

    const handleSaveModule = async (id) => {
        try {
            await saveModule(id);
            setModules(prev => prev.map(m => m.id === id ? { ...m, is_saved: true } : m));
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to save module." });
        }
    };

    const handleUnsaveModule = async (id) => {
        try {
            await unsaveModule(id);
            if (source === "saves") {
                setModules(prev => prev.filter(m => m.id !== id));
            } else {
                setModules(prev => prev.map(m => m.id === id ? { ...m, is_saved: false } : m));
            }
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to unsave module." });
        }
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

    const toggleTags = (id) => setExpandedTags(prev => ({ ...prev, [id]: !prev[id] }));

    const openModulePermissions = (module, evt, trigger) => {
        let anchor = null;
        if (trigger && trigger.getBoundingClientRect) {
            const rect = trigger.getBoundingClientRect();
            anchor = { left: rect.left, top: rect.bottom };
        }
        setPermissionsTarget({ moduleId: module.id, users: module.collaborators || [], anchor });
    };

    const handleAddUser = async (userObj) => {
        if (!permissionsTarget) return;
        try {
            await addModulePermission(permissionsTarget.moduleId, userObj.id);
            setModules(prev => prev.map(m => m.id === permissionsTarget.moduleId ? { ...m, collaborators: [...(m.collaborators || []), userObj] } : m));
            setPermissionsTarget(prev => ({ ...prev, users: [...prev.users, userObj] }));
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to add user." });
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!permissionsTarget) return;
        try {
            await removeModulePermission(permissionsTarget.moduleId, userId);
            setModules(prev => prev.map(m => m.id === permissionsTarget.moduleId ? { ...m, collaborators: (m.collaborators || []).filter(u => u.id !== userId) } : m));
            setPermissionsTarget(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to remove user." });
        }
    };

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
            setModalInfo({ open: true, type: "success", title: "Added", message: `Added "${module.name}" to folder "${folder.name}"` });
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Could not add to folder." });
        } finally {
            setAddToFolderTarget(null);
        }
    };

    const handleFinishMerge = () => {
        merge.executeMerge(
            () => setModalInfo({ open: true, type: "success", title: "Success", message: "Modules merged successfully!" }),
            () => setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to merge modules." })
        );
    };

    if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading library...</div>;

    return (
        <div className="modules-page" ref={containerRef} style={{ position: "relative", minHeight: "200px" }}>

            {merge.isMergeMode && (
                <div style={{
                    position: "sticky", top: 10, zIndex: 100, background: "#6366f1", color: "white",
                    padding: "12px 20px", borderRadius: "12px", marginBottom: "20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
                }}>
                    <div>
                        <strong>Merge Mode:</strong> {merge.selectedForMerge.length} modules selected.
                        <span style={{ marginLeft: 10, fontSize: "13px" }}>Click cards to select/deselect.</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={merge.openFinalMergeModal}
                            disabled={merge.selectedForMerge.length < 2}
                            style={{
                                padding: "6px 15px", borderRadius: "8px", border: "none", cursor: "pointer",
                                fontWeight: "bold", opacity: merge.selectedForMerge.length < 2 ? 0.6 : 1
                            }}
                        >
                            Process
                        </button>
                        <button
                            onClick={merge.cancelMergeMode}
                            style={{ background: "transparent", color: "white", border: "1px solid white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                        >
                            Cancel
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
                            toggleTags={toggleTags}

                            // Виправлено: у розділі Saves прибираємо onDelete, бо там є onUnsave
                            onEdit={source === "saves" ? null : () => navigate("/library/create-module", { state: { mode: "edit", moduleId: module.id, moduleData: module } })}
                            onDelete={source === "saves" ? null : () => handleDelete(module.id)}
                            deleteLabel="Delete"

                            onPermissions={source === "saves" ? null : openModulePermissions}
                            onAddToFolder={source === "saves" ? null : openAddToFolderMenu}

                            onSave={handleSaveModule}
                            onUnsave={handleUnsaveModule}

                            onMerge={merge.handleMergeToggle}
                            isMergeMode={merge.isMergeMode}
                            isSelected={merge.selectedForMerge.some(m => m.id === module.id)}
                            onSelect={merge.toggleModuleSelection}
                        />
                    ))}
                </div>
            )}

            {merge.isMergeModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "380px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ marginBottom: "20px" }}>Finalize Merge</h3>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }}>New Module Name</label>
                            <input
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                                type="text"
                                value={merge.mergeForm.name}
                                onChange={(e) => merge.setMergeForm({...merge.mergeForm, name: e.target.value})}
                            />
                        </div>
                        <div style={{ marginBottom: "25px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#666" }}>New Topic</label>
                            <select
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                                value={merge.mergeForm.topic}
                                onChange={(e) => merge.setMergeForm({...merge.mergeForm, topic: e.target.value})}
                            >
                                <option value="">Select Topic...</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => merge.setIsMergeModalOpen(false)} style={{ padding: "10px 20px", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                Back
                            </button>
                            <button onClick={handleFinishMerge} style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                                Confirm Merge
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {permissionsTarget && (
                <div style={{ position: "fixed", left: permissionsTarget.anchor?.left, top: permissionsTarget.anchor?.top, zIndex: 300 }}>
                    <PermissionsMenu
                        moduleId={permissionsTarget.moduleId}
                        users={permissionsTarget.users}
                        onAddUser={handleAddUser}
                        onRemoveUser={handleRemoveUser}
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
                            Add "{addToFolderTarget.module.name}" to:
                        </div>
                        {folders.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", color: "gray", fontSize: "13px" }}>No folders found.</div>
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