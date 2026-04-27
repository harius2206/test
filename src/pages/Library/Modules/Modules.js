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
    unsaveModule,
    toggleModuleVisibility,
    pinModule,
    unpinModule
} from "../../../api/modulesApi";
import { addModuleToFolder, getFolders } from "../../../api/foldersApi";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n";
import { parseApiErrors } from "../../../utils/parseApiErrors";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import ColoredIcon from "../../../components/coloredIcon";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import Loader from "../../../components/loader/loader";
import ModuleImportExportModal from "../../../components/ModuleImportExportModal/ModuleImportExportModal";

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

const resolveVisibility = (item) => {
    if (item.visible === "private" || item.private === true || item.is_private === true) {
        return "private";
    }
    return "public";
};

export default function Modules({ source = "library", preloadedModules, preloadedFolders, loadingParent, onRefresh }) {
    const { t } = useI18n();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { user } = useAuth();

    const [mModules, mSetModules] = useState([]);
    const [mFolders, mSetFolders] = useState([]);
    const [mTopics, mSetTopics] = useState([]);
    const [mLoading, mSetLoading] = useState(true);
    const [mError, mSetError] = useState(null);

    const [mExpandedTags, mSetExpandedTags] = useState({});
    const [mVisibleCount, mSetVisibleCount] = useState(3);

    const [mPermissionsTarget, mSetPermissionsTarget] = useState(null);
    const [mImportExportTarget, mSetImportExportTarget] = useState(null);
    const [mSortType, mSetSortType] = useState("date");
    const [mAddToFolderTarget, mSetAddToFolderTarget] = useState(null);

    const [mModalInfo, mSetModalInfo] = useState({ open: false, type: "info", title: "", message: "", onConfirm: null });

    const handleCloseModal = () => mSetModalInfo((prev) => ({ ...prev, open: false }));

    const mapModulesData = useCallback((rawModules, currentUser) => {
        return rawModules.map(m => {
            let moduleAuthor = m.user;
            if (typeof moduleAuthor === "number" || typeof moduleAuthor === "string") {
                if (String(moduleAuthor) === String(currentUser?.id)) {
                    moduleAuthor = { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar };
                } else {
                    moduleAuthor = { id: moduleAuthor, username: "User" };
                }
            } else if (!moduleAuthor && currentUser) {
                moduleAuthor = { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar };
            }

            return {
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: moduleAuthor,
                topic: m.topic,
                cards_count: m.cards ? m.cards.length : (m.cards_count || 0),
                collaborators: m.collaborators || [],
                is_saved: source === "saves" ? true : m.is_saved,
                visible: resolveVisibility(m),
                pinned: m.pinned
            };
        });
    }, [source]);

    const loadData = useCallback(async () => {
        if (!user || !user.id) { mSetLoading(false); return; }

        try {
            mSetLoading(true);

            if (source === "library" && preloadedModules) {
                mSetModules(mapModulesData(preloadedModules, user));
            } else if (source === "saves") {
                const savedResp = await getSavedModules(user.id);
                mSetModules(mapModulesData(savedResp.data.results || savedResp.data || [], user));
            } else {
                const userResp = await getUserDetails(user.id);
                mSetModules(mapModulesData(userResp.data.modules || [], userResp.data));
            }

            if (preloadedFolders) {
                mSetFolders(preloadedFolders);
            } else {
                const foldersResp = await getFolders();
                mSetFolders(foldersResp.data.results || foldersResp.data || []);
            }

            const topicsResp = await getTopics();
            mSetTopics(topicsResp.data || []);

            mSetError(null);
        } catch (err) {
            console.error("Failed to load modules/folders", err);
            mSetError(t("mErrorLoadingData") || "Failed to load data");
        } finally {
            mSetLoading(false);
        }
    }, [user, source, preloadedModules, preloadedFolders, mapModulesData, t]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSort = (type) => {
        mSetSortType(type);
        mSetModules(prev => {
            const sorted = [...prev];
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            else sorted.sort((a, b) => b.id - a.id);
            return sorted;
        });
    };

    const refreshParentOrLocal = () => {
        if (onRefresh) onRefresh();
        else loadData();
    };

    const handleSaveModule = async (id) => {
        try {
            await saveModule(id);
            mSetModules(prev => prev.map(m => m.id === id ? { ...m, is_saved: true } : m));
        } catch (err) {
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mSaveModuleFailed"), onConfirm: null });
        }
    };

    const handleUnsaveModule = async (id) => {
        try {
            await unsaveModule(id);
            if (source === "saves") {
                mSetModules(prev => prev.filter(m => m.id !== id));
            } else {
                mSetModules(prev => prev.map(m => m.id === id ? { ...m, is_saved: false } : m));
            }
            if (source !== "saves") refreshParentOrLocal();
        } catch (err) {
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mUnsaveModuleFailed"), onConfirm: null });
        }
    };

    const handlePinModule = async (id) => {
        const oldModules = [...mModules];
        mSetModules(prev => prev.map(m => m.id === id ? { ...m, pinned: true } : m));
        try {
            await pinModule(id);
            refreshParentOrLocal();
        } catch (err) {
            mSetModules(oldModules);
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mPinModuleFailed"), onConfirm: null });
        }
    };

    const handleUnpinModule = async (id) => {
        const oldModules = [...mModules];
        mSetModules(prev => prev.map(m => m.id === id ? { ...m, pinned: false } : m));
        try {
            await unpinModule(id);
            refreshParentOrLocal();
        } catch (err) {
            mSetModules(oldModules);
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mUnpinModuleFailed"), onConfirm: null });
        }
    };

    const handleDelete = (id) => {
        mSetModalInfo({
            open: true,
            type: "confirm",
            title: t("mDeleteModuleTitle") || "Delete Module",
            message: t("mDeleteModuleConfirm"),
            onConfirm: async () => {
                mSetModalInfo(prev => ({ ...prev, open: false }));
                try {
                    await deleteModule(id);
                    refreshParentOrLocal();
                } catch (err) {
                    setTimeout(() => {
                        mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mDeleteModuleFailed"), onConfirm: null });
                    }, 300);
                }
            }
        });
    };

    const handleVisibility = async (module) => {
        const newStatus = module.visible === "private" ? "public" : "private";
        mSetModules(prev => prev.map(m => m.id === module.id ? { ...m, visible: newStatus } : m));
        try {
            await toggleModuleVisibility(module.id, newStatus);
        } catch (err) {
            const oldStatus = module.visible;
            mSetModules(prev => prev.map(m => m.id === module.id ? { ...m, visible: oldStatus } : m));
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mVisibilityChangeFailed"), onConfirm: null });
        }
    };

    const toggleTags = (id) => mSetExpandedTags(prev => ({ ...prev, [id]: !prev[id] }));

    const openModulePermissions = (module, evt, trigger) => {
        let anchor = null;
        if (trigger && trigger.getBoundingClientRect && containerRef.current) {
            const rect = trigger.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            anchor = {
                left: rect.left - containerRect.left,
                top: rect.bottom - containerRect.top
            };
        }
        mSetPermissionsTarget({ moduleId: module.id, users: module.collaborators || [], anchor });
    };

    const handleAddUser = async (userObj) => {
        if (!mPermissionsTarget) return;
        try {
            await addModulePermission(mPermissionsTarget.moduleId, userObj.id);
            mSetModules(prev => prev.map(m => m.id === mPermissionsTarget.moduleId ? { ...m, collaborators: [...(m.collaborators || []), userObj] } : m));
            mSetPermissionsTarget(prev => ({ ...prev, users: [...prev.users, userObj] }));
        } catch (err) {
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mAddUserFailed"), onConfirm: null });
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!mPermissionsTarget) return;
        try {
            await removeModulePermission(mPermissionsTarget.moduleId, userId);
            mSetModules(prev => prev.map(m => m.id === mPermissionsTarget.moduleId ? { ...m, collaborators: (m.collaborators || []).filter(u => u.id !== userId) } : m));
            mSetPermissionsTarget(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
        } catch (err) {
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mRemoveUserFailed"), onConfirm: null });
        }
    };

    const openAddToFolderMenu = (module, evt, trigger) => {
        let anchor = null;
        if (trigger && trigger.getBoundingClientRect && containerRef.current) {
            const rect = trigger.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            anchor = {
                left: (rect.left - containerRect.left) - 100,
                top: (rect.bottom - containerRect.top) + 5
            };
        }
        mSetAddToFolderTarget({ module, anchor });
    };

    const handleAddToFolder = async (folder) => {
        if (!mAddToFolderTarget) return;
        const { module } = mAddToFolderTarget;
        try {
            await addModuleToFolder(folder.id, module.id);
            mSetModalInfo({
                open: true,
                type: "success",
                title: t("mAddedTitle"),
                message: `${t("mAddedPrefix")} "${module.name}" ${t("mAddedToFolder")} "${folder.name}"`,
                onConfirm: null
            });
        } catch (err) {
            mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle"), message: t("mAddToFolderFailed"), onConfirm: null });
        } finally {
            mSetAddToFolderTarget(null);
        }
    };

    const merge = useMergeModules(onRefresh || loadData);

    const handleFinishMerge = () => {
        merge.executeMerge(
            () => {
                mSetModalInfo({ open: true, type: "success", title: t("mAddedTitle") || "Success", message: "Modules merged successfully!", onConfirm: null });
                refreshParentOrLocal();
            },
            (err) => {
                const parsedErrors = parseApiErrors(err?.response?.data);
                const errorMsg = parsedErrors.length > 0
                    ? parsedErrors.join("\n")
                    : (err?.message || "Failed to merge modules.");
                mSetModalInfo({ open: true, type: "error", title: t("mErrorTitle") || "Error", message: errorMsg, onConfirm: null });
            }
        );
    };

    if (mLoading) return <Loader />;

    return (
        <div className="modules-page" ref={containerRef} style={{ position: "relative", minHeight: "200px" }}>

            {merge.isMergeMode && (
                <div style={{
                    position: "sticky", top: 10, zIndex: 10, background: "#6366f1", color: "white",
                    padding: "12px 20px", borderRadius: "12px", marginBottom: "20px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: "10px",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
                }}>
                    <div>
                        <strong>{t("mMergeModeTitle")}</strong> {merge.selectedForMerge.length} {t("mModulesSelected")}
                        <span style={{ marginLeft: 10, fontSize: "13px" }}>{t("mMergeClickInstruction")}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={merge.openFinalMergeModal} disabled={merge.selectedForMerge.length < 2} style={{ padding: "6px 15px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", opacity: merge.selectedForMerge.length < 2 ? 0.6 : 1 }}>Process</button>
                        <button onClick={merge.cancelMergeMode} style={{ background: "transparent", color: "white", border: "1px solid white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="library-controls" style={{ display: "flex", justifyContent: "space-between" }}>
                <SortMenu onSort={handleSort} />
            </div>

            {mError ? (
                <div style={{ padding: 40, color: "red", textAlign: "center", width: "100%", gridColumn: "1 / -1" }}>{mError}</div>
            ) : mModules.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "gray", width: "100%", gridColumn: "1 / -1" }}>{t("mNoModulesYet")}</div>
            ) : (
                <div className="module-list">
                    {mModules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            visibleCount={mVisibleCount}
                            expanded={mExpandedTags[module.id]}
                            toggleTags={toggleTags}

                            onEdit={source === "saves" ? null : () => navigate("/library/create-module", { state: { mode: "edit", moduleId: module.id, moduleData: module } })}
                            onDelete={source === "saves" ? null : () => handleDelete(module.id)}
                            deleteLabel="Delete"

                            onPermissions={source === "saves" ? null : openModulePermissions}
                            onAddToFolder={source === "saves" ? null : openAddToFolderMenu}
                            onVisibilityToggle={source === "saves" ? null : handleVisibility}

                            onExport={source === "saves" ? null : () => mSetImportExportTarget(module)}

                            onSave={handleSaveModule}
                            onUnsave={handleUnsaveModule}
                            onPin={handlePinModule}
                            onUnpin={handleUnpinModule}

                            onMerge={merge.handleMergeToggle}
                            isMergeMode={merge.isMergeMode}
                            isSelected={merge.selectedForMerge.some(m => m.id === module.id)}
                            onSelect={merge.toggleModuleSelection}
                        />
                    ))}
                </div>
            )}

            {merge.isMergeModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "var(--dm-bg, var(--lib-bg, #fff))", color: "var(--dm-text, var(--lib-text, #000))", padding: "30px", borderRadius: "20px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                        <h3 style={{ marginBottom: "20px", marginTop: 0 }}>Finalize Merge</h3>
                        <div style={{ marginBottom: "15px" }}>
                            <input
                                style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid var(--dm-border, var(--lib-border, #ddd))", background: "var(--dm-bg, var(--lib-bg, #fff))", color: "var(--dm-text, var(--lib-text, #000))", boxSizing: "border-box", outline: "none" }}
                                type="text"
                                value={merge.mergeForm.name}
                                onChange={(e) => merge.setMergeForm({...merge.mergeForm, name: e.target.value})}
                                placeholder="New Module Name"
                            />
                        </div>
                        <div style={{ marginBottom: "25px" }}>
                            <select
                                style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid var(--dm-border, var(--lib-border, #ddd))", background: "var(--dm-bg, var(--lib-bg, #fff))", color: "var(--dm-text, var(--lib-text, #000))", boxSizing: "border-box", outline: "none", cursor: "pointer" }}
                                value={merge.mergeForm.topic}
                                onChange={(e) => merge.setMergeForm({...merge.mergeForm, topic: e.target.value})}
                            >
                                <option value="">{t("mSelectTopicPlaceholder") || "Select a topic"}</option>
                                {mTopics.map(tOption => <option key={tOption.id} value={tOption.id}>{tOption.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={(e) => { e.preventDefault(); merge.setIsMergeModalOpen(false); }} style={{ padding: "10px 20px", background: "var(--dm-border, var(--lib-border, #f0f0f0))", color: "var(--dm-text, var(--lib-text, #000))", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>{t("mBackButton") || "Cancel"}</button>
                            <button onClick={handleFinishMerge} style={{ padding: "10px 20px", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>{t("mConfirmMergeButton") || "Merge"}</button>
                        </div>
                    </div>
                </div>
            )}

            {mPermissionsTarget && (
                <div style={{ position: "absolute", left: mPermissionsTarget.anchor?.left, top: mPermissionsTarget.anchor?.top, zIndex: 300 }}>
                    <PermissionsMenu moduleId={mPermissionsTarget.moduleId} users={mPermissionsTarget.users} onAddUser={handleAddUser} onRemoveUser={handleRemoveUser} onClose={() => mSetPermissionsTarget(null)} />
                </div>
            )}

            {mAddToFolderTarget && (
                <>
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 301 }} onClick={() => mSetAddToFolderTarget(null)} />
                    <div className="dropdown-menu" style={{ position: "absolute", left: mAddToFolderTarget.anchor?.left || "50%", top: mAddToFolderTarget.anchor?.top || "50%", zIndex: 302, background: "var(--clr-card-bg)", border: "1px solid var(--clr-border-light)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", padding: "8px 0", minWidth: "200px", width: "max-content", maxHeight: "300px", overflowY: "auto" }}>
                        <div style={{ padding: "8px 16px", fontWeight: "bold", borderBottom: "1px solid var(--clr-border-light)", fontSize: "14px", color: "var(--clr-text-secondary)" }}>Add "{mAddToFolderTarget.module.name}" to:</div>
                        {mFolders.length === 0 ? <div style={{ padding: "12px", textAlign: "center", color: "var(--clr-text-secondary)", fontSize: "13px" }}>No folders found.</div> : mFolders.map(folder => (
                            <div key={folder.id} onClick={() => handleAddToFolder(folder)} style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                                <ColoredIcon icon={FolderIcon} color={folder.color || "#6366f1"} size={18} />
                                <span style={{ fontSize: "14px", color: "var(--clr-text)" }}>{folder.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {mImportExportTarget && (
                <ModuleImportExportModal
                    open={true}
                    onClose={() => mSetImportExportTarget(null)}
                    moduleId={mImportExportTarget.id}
                    moduleName={mImportExportTarget.name}
                    onSuccess={() => {
                        mSetImportExportTarget(null);
                        refreshParentOrLocal();
                    }}
                />
            )}

            <ModalMessage
                open={mModalInfo.open}
                type={mModalInfo.type}
                title={mModalInfo.title}
                message={mModalInfo.message}
                onClose={handleCloseModal}
                onConfirm={mModalInfo.onConfirm}
            />
        </div>
    );
}