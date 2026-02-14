import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    getFolder, updateFolder, deleteFolder, toggleFolderVisibility,
    removeModuleFromFolder, addModuleToFolder, pinFolder, unpinFolder
} from "../../../api/foldersApi";
import { getTopics, toggleModuleVisibility } from "../../../api/modulesApi";
import { addModulePermission, removeModulePermission } from "../../../api/modulesApi";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import ColoredIcon from "../../../components/coloredIcon";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import EditableField from "../../../components/editableField/editableField";
import Button from "../../../components/button/button";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import Loader from "../../../components/loader/loader";
import ModuleImportExportModal from "../../../components/ModuleImportExportModal/ModuleImportExportModal";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as EditIcon } from "../../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as TickIcon } from "../../../images/tick.svg";
import { ReactComponent as UntickIcon } from "../../../images/unTick.svg";
import { ReactComponent as FolderIcon } from "../../../images/folder.svg";
import { ReactComponent as EyeOpenedIcon } from "../../../images/eyeOpened.svg";
import { ReactComponent as EyeClosedIcon } from "../../../images/eyeClosed.svg";

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

const resolveVisibility = (item) => {
    if (item.visible === "private" || item.private === true || item.is_private === true) {
        return "private";
    }
    return "public";
};

export default function FolderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useI18n();
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
    const [importExportTarget, setImportExportTarget] = useState(null);
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
                collaborators: m.collaborators || [],
                visible: resolveVisibility(m)
            }));

            const folderVisibility = resolveVisibility(data);

            setFolderState({
                ...data,
                visible: folderVisibility,
                private: folderVisibility === "private",
                pinned: data.pinned
            });
            setModules(mappedModules);
            setTopics(topicsRes.data || []);

            if (data.user && Array.isArray(data.user.folders)) {
                setUserFolders(data.user.folders);
            }

        } catch (err) {
            console.error(err);
            setError(t("fpErrorLoadingFolder"));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
        if (!window.confirm(t("fpDeleteFolderConfirm"))) return;
        try {
            await deleteFolder(id);
            navigate("/library");
        } catch (err) {
            alert(t("fpDeleteFolderError"));
        }
    };

    const handleTogglePrivate = async () => {
        if (!folderState) return;
        const currentIsPrivate = folderState.private;
        const newStatus = currentIsPrivate ? "public" : "private";
        setFolderState(prev => ({ ...prev, private: !currentIsPrivate, visible: newStatus }));
        try {
            await toggleFolderVisibility(id, newStatus);
        } catch (err) {
            setFolderState(prev => ({ ...prev, private: currentIsPrivate, visible: currentIsPrivate ? "private" : "public" }));
            setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpChangeVisibilityError") });
        }
    };

    const handleModuleVisibility = async (module) => {
        const currentStatus = module.visible;
        const newStatus = currentStatus === "private" ? "public" : "private";
        setModules(prev => prev.map(m => m.id === module.id ? { ...m, visible: newStatus } : m));
        try {
            await toggleModuleVisibility(module.id, newStatus);
        } catch (err) {
            setModules(prev => prev.map(m => m.id === module.id ? { ...m, visible: currentStatus } : m));
            setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpModuleVisibilityError") });
        }
    };

    const handlePin = async () => {
        if (!folderState) return;
        const isPinned = folderState.pinned;
        setFolderState(prev => ({ ...prev, pinned: !isPinned }));
        try {
            if (isPinned) await unpinFolder(id);
            else await pinFolder(id);
        } catch (err) {
            setFolderState(prev => ({ ...prev, pinned: isPinned }));
            setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpPinError") });
        }
    };

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

    const handleEditModule = (module) => {
        navigate("/library/create-module", {
            state: { mode: "edit", moduleId: module.id, moduleData: module, folderId: id }
        });
    };

    const handleRemoveModule = async (moduleId) => {
        if (!window.confirm(t("fpRemoveModuleConfirm"))) return;
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
            setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpAddUserError") });
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
            setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpRemoveUserError") });
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
            setModalInfo({
                open: true,
                type: "success",
                title: t("fpModalAddedTitle"),
                message: t("fpAddToFolderSuccess").replace("{moduleName}", addToFolderTarget.module.name).replace("{folderName}", targetFolder.name)
            });
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpAddToFolderError") });
        } finally {
            setAddToFolderTarget(null);
        }
    };

    const handleFinishMerge = () => {
        merge.executeMerge(
            () => setModalInfo({ open: true, type: "success", title: t("fpModalSuccessTitle"), message: t("fpMergeSuccess") }),
            () => setModalInfo({ open: true, type: "error", title: t("fpModalErrorTitle"), message: t("fpMergeError") })
        );
    };

    if (loading) return <Loader fullscreen />;

    if (error) return <div className="folder-page" style={{padding: 20, color: 'red'}}>{error}</div>;
    if (!folderState) return null;

    const isOwnFolder = user && (folderState.user?.id === user.id || folderState.user === user.id);
    const canEditFolder = isOwnFolder || !folderState.user;

    return (
        <div className="folder-page" ref={containerRef} style={{ position: "relative" }}>

            {merge.isMergeMode && (
                <div className="merge-banner" style={{
                    position: "sticky", top: 10, zIndex: 100, background: "#6366f1", color: "white",
                    padding: "12px 20px", borderRadius: "12px", marginBottom: "20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
                }}>
                    <div>
                        <strong>{t("fpMergeModeBannerStrong")}:</strong> {t("fpMergeModeBanner").replace("{count}", merge.selectedForMerge.length)}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={merge.openFinalMergeModal} disabled={merge.selectedForMerge.length < 2} style={{ padding: "6px 15px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", opacity: merge.selectedForMerge.length < 2 ? 0.6 : 1 }}>{t("fpProcessButton")}</button>
                        <button onClick={merge.cancelMergeMode} style={{ background: "transparent", color: "white", border: "1px solid white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>{t("fpCancelButton")}</button>
                    </div>
                </div>
            )}

            <div className="folder-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {renaming ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <EditableField value={renameValue} onSave={setRenameValue} editable={true} autosave={true} />
                        <Button variant="static" onClick={saveRename} width="90px" height="36px">{t("fpSaveButton")}</Button>
                        <Button variant="hover" onClick={cancelRename} width="90px" height="36px">{t("fpCancelButton")}</Button>
                    </div>
                ) : (
                    <h2 className="folder-title" style={{ margin: 0 }}>{folderState.name}</h2>
                )}

                <button onClick={() => navigate("/library")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }} title={t("fpCloseButton")}>
                    <CloseIcon width={28} height={28} />
                </button>
            </div>

            <div className="folder-controls" style={{ justifyContent: "space-between", marginTop: 8, display: "flex", alignItems: "center" }}>
                <SortMenu onSort={handleSort} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => navigate("/library/create-module", { state: { folderId: folderState.id } })} style={{ background: "#6366f1", color: "#fff", border: "none", height: 40, minWidth: 140, borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}>
                        {t("fpAddModuleButton")}
                    </button>

                    <DropdownMenu
                        align="right" width={220}
                        items={[
                            ...(canEditFolder ? [
                                { label: t("fpRenameLabel"), onClick: startRename, icon: <EditIcon width={16} height={16} /> },
                                { label: t("fpDeleteLabel"), onClick: handleDeleteFolder, icon: <DeleteIcon width={16} height={16} /> },
                                {
                                    label: folderState.private ? t("fpMakePublicLabel") : t("fpMakePrivateLabel"),
                                    onClick: handleTogglePrivate,
                                    icon: <ColoredIcon icon={folderState.private ? EyeClosedIcon : EyeOpenedIcon} size={16} />
                                },
                                { label: folderState.pinned ? t("fpUnpinLabel") : t("fpPinLabel"), onClick: handlePin, icon: <ColoredIcon icon={folderState.pinned ? TickIcon : UntickIcon} size={16} /> }
                            ] : []),
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
                                onVisibilityToggle={handleModuleVisibility}
                                onExport={() => setImportExportTarget(module)}
                                deleteLabel={t("fpRemoveFromFolderLabel")}
                                onDelete={() => handleRemoveModule(module.id)}
                                isMergeMode={merge.isMergeMode}
                                isSelected={merge.selectedForMerge.some(m => m.id === module.id)}
                                onSelect={merge.toggleModuleSelection}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-folder">{t("fpNoModules")}</div>
                )}
            </div>

            {merge.isMergeModalOpen && (
                <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: "white", padding: "30px", borderRadius: "20px", width: "380px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ marginBottom: "20px" }}>{t("fpFinalizeMergeTitle")}</h3>
                        <div style={{ marginTop: 15 }}>
                            <input style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ddd" }} type="text" value={merge.mergeForm.name} onChange={(e) => merge.setMergeForm({...merge.mergeForm, name: e.target.value})} placeholder={t("fpNewNamePlaceholder")} />
                        </div>
                        <div style={{ marginTop: 15, marginBottom: 20 }}>
                            <select style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ddd" }} value={merge.mergeForm.topic} onChange={(e) => merge.setMergeForm({...merge.mergeForm, topic: e.target.value})}>
                                <option value="">{t("fpSelectTopicPlaceholder")}</option>
                                {topics.map(tOption => <option key={tOption.id} value={tOption.id}>{tOption.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => merge.setIsMergeModalOpen(false)} style={{ padding: "10px 15px", borderRadius: "8px", border: "none", cursor: "pointer" }}>{t("fpBackButton")}</button>
                            <button onClick={handleFinishMerge} style={{ background: "#6366f1", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>{t("fpConfirmMergeButton")}</button>
                        </div>
                    </div>
                </div>
            )}

            {permissionsTarget && (
                <div style={{ position: "fixed", left: permissionsTarget.anchor?.left, top: permissionsTarget.anchor?.top, zIndex: 300 }}>
                    <PermissionsMenu moduleId={permissionsTarget.moduleId} users={permissionsTarget.users} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} onClose={() => setPermissionsTarget(null)} />
                </div>
            )}

            {addToFolderTarget && (
                <>
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 301 }} onClick={() => setAddToFolderTarget(null)} />
                    <div className="dropdown-menu" style={{ position: "fixed", left: addToFolderTarget.anchor?.left || "50%", top: addToFolderTarget.anchor?.top || "50%", zIndex: 302, background: "white", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", padding: "8px 0", minWidth: "200px", maxHeight: "300px", overflowY: "auto" }}>
                        <div style={{ padding: "8px 16px", fontWeight: "bold", borderBottom: "1px solid #eee", fontSize: "14px", color: "#666" }}>
                            {t("fpAddToFolderTitle").replace("{moduleName}", addToFolderTarget.module.name)}
                        </div>
                        {userFolders.length === 0 ? <div style={{ padding: "12px", textAlign: "center", color: "gray", fontSize: "13px" }}>{t("fpNoFoldersFound")}</div> : userFolders.map(folder => (
                            <div key={folder.id} onClick={() => handleAddToFolder(folder)} style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                                <ColoredIcon icon={FolderIcon} color={folder.color || "#6366f1"} size={18} />
                                <span style={{ fontSize: "14px", color: "#333" }}>{folder.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {importExportTarget && (
                <ModuleImportExportModal
                    open={true}
                    onClose={() => setImportExportTarget(null)}
                    moduleId={importExportTarget.id}
                    moduleName={importExportTarget.name}
                    onSuccess={() => {
                        setImportExportTarget(null);
                        loadData();
                    }}
                />
            )}

            <ModalMessage open={modalInfo.open} type={modalInfo.type} title={modalInfo.title} message={modalInfo.message} onClose={handleCloseModal} />
        </div>
    );
}