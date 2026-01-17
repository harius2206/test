import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getFolder, updateFolder, deleteFolder, toggleFolderVisibility,
    removeModuleFromFolder, addModuleToFolder
} from "../../../api/foldersApi";
import { getUserDetails } from "../../../api/usersApi";
// Використовуємо готові функції для отримання тем
import { addModulePermission, removeModulePermission, getTopics } from "../../../api/modulesApi";
import { useAuth } from "../../../context/AuthContext";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import ColoredIcon from "../../../components/coloredIcon";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import EditableField from "../../../components/editableField/editableField";
import Button from "../../../components/button/button";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as EditIcon } from "../../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as ShareIcon } from "../../../images/share.svg";
import { ReactComponent as TickIcon } from "../../../images/tick.svg";
import { ReactComponent as UntickIcon } from "../../../images/unTick.svg";
import { ReactComponent as FolderIcon } from "../../../images/folder.svg";

// Імпортуємо кастомний хук для злиття
import { useMergeModules } from "../../../hooks/useMergeModules";

import "./folderInfo.css";

const getFlagUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

export default function FolderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const containerRef = useRef(null);

    const [folderState, setFolderState] = useState(null);
    const [modules, setModules] = useState([]);
    const [topics, setTopics] = useState([]);
    const [userFolders, setUserFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount, setVisibleCount] = useState(9);
    const [renaming, setRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");

    const [permissionsTarget, setPermissionsTarget] = useState(null);
    const [addToFolderTarget, setAddToFolderTarget] = useState(null);
    const [modalInfo, setModalInfo] = useState({ open: false, type: "info", title: "", message: "" });

    const handleCloseModal = () => setModalInfo(prev => ({ ...prev, open: false }));

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [folderRes, topicsRes] = await Promise.all([
                getFolder(id),
                getTopics()
            ]);

            const data = folderRes.data;
            const mappedModules = (data.modules || []).map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: m.user,
                topic: m.topic,
                cards_count: m.cards_count || (m.cards ? m.cards.length : 0),
                collaborators: m.collaborators || []
            }));

            setFolderState({
                ...data,
                private: data.visible === "private" || data.private === true
            });
            setModules(mappedModules);
            setTopics(topicsRes.data || []);

            if (user?.id) {
                const userRes = await getUserDetails(user.id);
                setUserFolders(userRes.data.folders || []);
            }

        } catch (err) {
            setError("Folder not found or failed to load.");
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ВИКОРИСТАННЯ ХУКА ЗЛИТТЯ
    const merge = useMergeModules(loadData);

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

    const toggleTags = (modId) => setExpandedTags((prev) => ({ ...prev, [modId]: !prev[modId] }));

    const handleSort = (type) => {
        setModules(prev => {
            const sorted = [...prev];
            if (type === "date") sorted.sort((a, b) => b.id - a.id);
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            if (type === "terms") sorted.sort((a, b) => b.cards_count - a.cards_count);
            if (type === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            return sorted;
        });
    };

    const handleDeleteFolder = async () => {
        if (!window.confirm("Delete this folder? This action cannot be undone.")) return;
        try {
            await deleteFolder(id);
            navigate("/library");
        } catch (err) {
            alert("Failed to delete folder");
        }
    };

    const handleTogglePrivate = async () => {
        if (!folderState) return;
        const newPrivacy = !folderState.private;
        const visibleStatus = newPrivacy ? "private" : "public";
        setFolderState(prev => ({ ...prev, private: newPrivacy }));
        try {
            await toggleFolderVisibility(id, visibleStatus);
        } catch (err) {
            setFolderState(prev => ({ ...prev, private: !newPrivacy }));
        }
    };

    const handlePin = async () => {};

    const startRename = () => { setRenaming(true); setRenameValue(folderState.name); };
    const cancelRename = () => { setRenaming(false); setRenameValue(""); };
    const saveRename = async () => {
        if (!renameValue.trim()) return cancelRename();
        try {
            await updateFolder(id, { name: renameValue.trim() });
            setFolderState(prev => ({ ...prev, name: renameValue.trim() }));
            setRenaming(false);
        } catch (err) {}
    };

    const handleExport = () => {};

    const handleEditModule = (module) => {
        navigate("/library/create-module", {
            state: { mode: "edit", moduleId: module.id, moduleData: module, folderId: id }
        });
    };

    const handleRemoveModule = async (moduleId) => {
        if (!window.confirm("Remove module from this folder?")) return;
        try {
            await removeModuleFromFolder(id, moduleId);
            setModules(prev => prev.filter(m => m.id !== moduleId));
        } catch (err) {}
    };

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
            setModules(prev => prev.map(m => {
                if (m.id === permissionsTarget.moduleId) {
                    return { ...m, collaborators: [...(m.collaborators || []), userObj] };
                }
                return m;
            }));
            setPermissionsTarget(prev => ({ ...prev, users: [...prev.users, userObj] }));
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to add user." });
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!permissionsTarget) return;
        try {
            await removeModulePermission(permissionsTarget.moduleId, userId);
            setModules(prev => prev.map(m => {
                if (m.id === permissionsTarget.moduleId) {
                    return { ...m, collaborators: (m.collaborators || []).filter(u => u.id !== userId) };
                }
                return m;
            }));
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

    const handleAddToFolder = async (targetFolder) => {
        if (!addToFolderTarget) return;
        try {
            await addModuleToFolder(targetFolder.id, addToFolderTarget.module.id);
            setModalInfo({ open: true, type: "success", title: "Added", message: `Added "${addToFolderTarget.module.name}" to folder "${targetFolder.name}"` });
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Could not add to folder." });
        } finally {
            setAddToFolderTarget(null);
        }
    };

    // Обробник злиття через хук
    const handleFinishMerge = () => {
        merge.executeMerge(
            () => setModalInfo({ open: true, type: "success", title: "Success", message: "Modules merged successfully!" }),
            () => setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to merge modules." })
        );
    };

    if (loading) return <div className="folder-page" style={{padding: 20}}>Loading...</div>;
    if (error) return <div className="folder-page" style={{padding: 20, color: 'red'}}>{error}</div>;
    if (!folderState) return null;

    return (
        <div className="folder-page" ref={containerRef} style={{ position: "relative" }}>

            {/* ПАНЕЛЬ РЕЖИМУ МЕРДЖА */}
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

            <div className="folder-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {renaming ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <EditableField value={renameValue} onSave={setRenameValue} editable={true} autosave={true} />
                        <Button variant="static" onClick={saveRename} width="90px" height="36px">Save</Button>
                        <Button variant="hover" onClick={cancelRename} width="90px" height="36px">Cancel</Button>
                    </div>
                ) : (
                    <h2 className="folder-title" style={{ margin: 0 }}>{folderState.name}</h2>
                )}

                <button
                    onClick={() => navigate("/library")}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: 4, display: "flex", alignItems: "center"
                    }}
                    title="Close"
                >
                    <CloseIcon width={28} height={28} />
                </button>
            </div>

            <div className="folder-controls" style={{ justifyContent: "space-between", marginTop: 8, display: "flex", alignItems: "center" }}>
                <SortMenu onSort={handleSort} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() => navigate("/library/create-module", { state: { folderId: folderState.id } })}
                        style={{
                            background: "#6366f1", color: "#fff", border: "none", height: 40,
                            minWidth: 140, borderRadius: 6, fontWeight: "bold", cursor: "pointer"
                        }}
                    >
                        Add module
                    </button>

                    <DropdownMenu
                        align="right" width={220}
                        items={[
                            { label: "Rename", onClick: startRename, icon: <EditIcon width={16} height={16} /> },
                            { label: "Delete", onClick: handleDeleteFolder, icon: <DeleteIcon width={16} height={16} /> },
                            { label: folderState.private ? "Unprivate" : "Private", onClick: handleTogglePrivate, icon: <ColoredIcon icon={folderState.private ? TickIcon : UntickIcon} size={16} /> },
                            { label: folderState.pinned ? "Unpin" : "Pin", onClick: handlePin, icon: <ColoredIcon icon={folderState.pinned ? TickIcon : UntickIcon} size={16} /> },
                            { label: "Export", onClick: handleExport, icon: <ShareIcon width={16} height={16} /> },
                        ]}
                    >
                        <button className="btn-icon"><DotsIcon width={16} height={16} /></button>
                    </DropdownMenu>
                </div>
            </div>

            <div className="folder-modules" style={{ marginTop: 16 }}>
                {modules.length > 0 ? (
                    <div className="module-list">
                        {modules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                visibleCount={visibleCount}
                                expanded={!!expandedTags[module.id]}
                                toggleTags={toggleTags}
                                onEdit={() => handleEditModule(module)}
                                onPermissions={(e, trigger) => openModulePermissions(module, e, trigger)}
                                onAddToFolder={(e, trigger) => openAddToFolderMenu(module, e, trigger)}
                                deleteLabel={"Remove from folder"}
                                onDelete={() => handleRemoveModule(module.id)}
                                isMergeMode={merge.isMergeMode}
                                isSelected={merge.selectedForMerge.some(m => m.id === module.id)}
                                onSelect={merge.toggleModuleSelection}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-folder">No modules yet</div>
                )}
            </div>

            {merge.isMergeModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "380px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ marginBottom: "20px" }}>Finalize Merge</h3>
                        <div style={{ marginTop: 15 }}>
                            <label style={{ fontSize: "12px", color: "gray" }}>New Name</label>
                            <input
                                style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ddd" }}
                                type="text" value={merge.mergeForm.name}
                                onChange={(e) => merge.setMergeForm({...merge.mergeForm, name: e.target.value})}
                            />
                        </div>
                        <div style={{ marginTop: 15, marginBottom: 20 }}>
                            <label style={{ fontSize: "12px", color: "gray" }}>Topic</label>
                            <select
                                style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ddd" }}
                                value={merge.mergeForm.topic}
                                onChange={(e) => merge.setMergeForm({...merge.mergeForm, topic: e.target.value})}
                            >
                                <option value="">Select Topic...</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => merge.setIsMergeModalOpen(false)} style={{ padding: "10px 15px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Back</button>
                            <button onClick={handleFinishMerge} style={{ background: "#6366f1", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Confirm Merge</button>
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
                        {userFolders.length === 0 ? (
                            <div style={{ padding: "12px", textAlign: "center", color: "gray", fontSize: "13px" }}>No folders found.</div>
                        ) : (
                            userFolders.map(folder => (
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