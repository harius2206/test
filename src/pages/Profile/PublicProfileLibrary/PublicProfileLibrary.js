import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/usersApi";
import {
    saveModule,
    unsaveModule,
    pinModule,
    unpinModule,
    deleteModule
} from "../../../api/modulesApi";
import {
    pinFolder,
    unpinFolder
} from "../../../api/foldersApi";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n";

import UserAvatar from "../../../components/avatar/avatar";
import SortMenu from "../../../components/sortMenu/sortMenu";
import ModuleCard from "../../../components/ModuleCard/moduleCard";
import ColoredIcon from "../../../components/coloredIcon";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import Loader from "../../../components/loader/loader";

import { ReactComponent as StarIcon } from "../../../images/star.svg";
import { ReactComponent as FolderIcon } from "../../../images/folder.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as ExportIcon } from "../../../images/export.svg";
import { ReactComponent as PinIcon } from "../../../images/pin.svg";

import "./publicProfileLibrary.css";

const getFlagUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

export default function PublicProfileLibrary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { t } = useI18n();

    const [pplUserData, pplSetUserData] = useState(null);
    const [pplActiveTab, pplSetActiveTab] = useState("modules");
    const [pplLoading, pplSetLoading] = useState(true);
    const [pplError, pplSetError] = useState(null);
    const [pplModalInfo, pplSetModalInfo] = useState({ open: false, type: "info", title: "", message: "" });

    const [pplModulesList, pplSetModulesList] = useState([]);
    const [pplFoldersList, pplSetFoldersList] = useState([]);

    const pplHandleCloseModal = () => pplSetModalInfo(prev => ({ ...prev, open: false }));

    const pplLoadProfile = useCallback(async () => {
        if (!id) return;
        pplSetLoading(true);
        try {
            const res = await getUserDetails(id);
            const data = res.data;

            const pplHasAccess = (item) => {
                if (item.visible === "public") return true;
                if (currentUser && String(currentUser.id) === String(data.id)) return true;
                if (item.user_perm) return true;
                return false;
            };

            const pplAllowedModules = (data.modules || []).filter(pplHasAccess);
            const pplAllowedFolders = (data.folders || []).filter(pplHasAccess);

            let pplCalculatedRating = parseFloat(data.avg_rate || 0);
            if (pplCalculatedRating === 0 && pplAllowedModules.length > 0) {
                const pplRatedModules = pplAllowedModules.filter(m => m.avg_rate && parseFloat(m.avg_rate) > 0);
                if (pplRatedModules.length > 0) {
                    const sum = pplRatedModules.reduce((acc, m) => acc + parseFloat(m.avg_rate), 0);
                    pplCalculatedRating = sum / pplRatedModules.length;
                }
            }

            pplSetUserData({ ...data, avg_rate: pplCalculatedRating });

            const pplMappedModules = pplAllowedModules.map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: { id: data.id, username: data.username, avatar: getFlagUrl(data.avatar) },
                topic: m.topic,
                cards_count: m.cards_count !== undefined ? m.cards_count : (m.cards ? m.cards.length : 0),
                is_saved: m.saved,
                pinned: m.pinned,
                user_perm: m.user_perm // Зберігаємо права з бекенду
            }));
            pplSetModulesList(pplMappedModules);

            const pplMappedFolders = pplAllowedFolders.map(f => ({
                ...f,
                modules_count: f.modules_count || (f.modules ? f.modules.length : 0),
                user: { id: data.id, username: data.username, avatar: getFlagUrl(data.avatar) },
                is_saved: f.saved,
                pinned: f.pinned
            }));
            pplSetFoldersList(pplMappedFolders);

            pplSetError(null);
        } catch (err) {
            console.error("Failed to load profile", err);
            pplSetError(t("pplUserNotFoundError"));
        } finally {
            pplSetLoading(false);
        }
    }, [id, currentUser, t]);

    useEffect(() => {
        pplLoadProfile();
    }, [pplLoadProfile]);

    const pplHandleSort = (type) => {
        if (pplActiveTab === "modules") {
            pplSetModulesList(prev => {
                const sorted = [...prev];
                if (type === "date") sorted.sort((a, b) => b.id - a.id);
                if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
                if (type === "rating") sorted.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
                return sorted;
            });
        } else {
            pplSetFoldersList(prev => {
                const sorted = [...prev];
                if (type === "date") sorted.sort((a, b) => b.id - a.id);
                if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
                return sorted;
            });
        }
    };

    const pplHandleSaveModule = async (modId) => {
        try {
            await saveModule(modId);
            pplSetModulesList(prev => prev.map(m => m.id === modId ? { ...m, is_saved: true } : m));
            pplSetModalInfo({ open: true, type: "success", title: t("pplSavedTitle"), message: t("pplModuleSaveSuccess") });
        } catch (err) {
            pplSetModalInfo({ open: true, type: "error", title: t("pplErrorTitle"), message: t("pplModuleSaveError") });
        }
    };

    const pplHandleUnsaveModule = async (modId) => {
        try {
            await unsaveModule(modId);
            pplSetModulesList(prev => prev.map(m => m.id === modId ? { ...m, is_saved: false } : m));
        } catch (err) {
            pplSetModalInfo({ open: true, type: "error", title: t("pplErrorTitle"), message: t("pplModuleUnsaveError") });
        }
    };

    const pplHandlePinModule = async (modId) => {
        pplSetModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: true } : m));
        try {
            await pinModule(modId);
        } catch (err) {
            pplSetModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: false } : m));
            pplSetModalInfo({ open: true, type: "error", title: t("pplErrorTitle"), message: t("pplModulePinError") });
        }
    };

    const pplHandleUnpinModule = async (modId) => {
        pplSetModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: false } : m));
        try {
            await unpinModule(modId);
        } catch (err) {
            pplSetModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: true } : m));
            pplSetModalInfo({ open: true, type: "error", title: t("pplErrorTitle"), message: t("pplModuleUnpinError") });
        }
    };

    const pplHandleEditModule = (module) => {
        navigate("/library/create-module", {
            state: { mode: "edit", moduleId: module.id, moduleData: module }
        });
    };

    const pplHandleDeleteModule = async (modId) => {
        if (window.confirm(t("confirmDeleteMessage") || "Are you sure?")) {
            try {
                await deleteModule(modId);
                pplSetModulesList(prev => prev.filter(m => m.id !== modId));
            } catch (err) {
                pplSetModalInfo({ open: true, type: "error", title: t("pplErrorTitle"), message: t("pplModuleDeleteError") });
            }
        }
    };

    const pplHandlePinFolder = async (folder) => {
        const pplIsPinned = folder.pinned;
        pplSetFoldersList(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: !pplIsPinned } : f));
        try {
            if (pplIsPinned) {
                await unpinFolder(folder.id);
            } else {
                await pinFolder(folder.id);
            }
        } catch (err) {
            pplSetFoldersList(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: pplIsPinned } : f));
            pplSetModalInfo({ open: true, type: "error", title: t("pplErrorTitle"), message: t("pplFolderPinError") });
        }
    };

    if (pplLoading) return <Loader fullscreen />;
    if (pplError) return <div className="pp-container" style={{textAlign:"center", paddingTop:40, color:"red"}}>{pplError}</div>;
    if (!pplUserData) return null;

    const pplDisplayRating = pplUserData.avg_rate
        ? parseFloat(pplUserData.avg_rate).toFixed(1)
        : "0.0";

    return (
        <div className="pp-container">
            <div className="pp-header">
                <div className="pp-user-info">
                    <UserAvatar
                        src={getFlagUrl(pplUserData.avatar)}
                        name={pplUserData.username}
                        size={80}
                        fontSize={32}
                        disableStrictFallback={true}
                    />
                    <div className="pp-text-info">
                        <div className="pp-username-row">
                            <h2 className="pp-username">{pplUserData.username}</h2>
                            <div className="pp-rating-badge">
                                {pplDisplayRating} <StarIcon className="pp-star-icon" />
                            </div>
                        </div>
                        <p className="pp-bio">{pplUserData.bio || t("pplNoBio")}</p>
                    </div>
                </div>
            </div>

            <div className="pp-tabs">
                <button
                    className={`pp-tab ${pplActiveTab === "modules" ? "active" : ""}`}
                    onClick={() => pplSetActiveTab("modules")}
                >
                    {t("pplModulesTab")} ({pplModulesList.length})
                </button>
                <button
                    className={`pp-tab ${pplActiveTab === "folders" ? "active" : ""}`}
                    onClick={() => pplSetActiveTab("folders")}
                >
                    {t("pplFoldersTab")} ({pplFoldersList.length})
                </button>
            </div>

            <div className="pp-controls">
                <SortMenu onSort={pplHandleSort} />
            </div>

            <div className="pp-content-list">
                {pplActiveTab === "modules" ? (
                    pplModulesList.length === 0 ? (
                        <div className="pp-empty">{t("pplNoModules")}</div>
                    ) : (
                        <div className="module-list">
                            {pplModulesList.map((module) => {
                                // Перевірка прав через поле user_perm, яке повертає ваш API
                                const canEdit = module.user_perm === "editor" || module.user_perm === "owner";

                                return (
                                    <ModuleCard
                                        key={module.id}
                                        module={module}
                                        onSave={pplHandleSaveModule}
                                        onUnsave={pplHandleUnsaveModule}
                                        onPin={pplHandlePinModule}
                                        onUnpin={pplHandleUnpinModule}
                                        onEdit={canEdit ? pplHandleEditModule : null}
                                        onDelete={canEdit ? pplHandleDeleteModule : null}
                                    />
                                );
                            })}
                        </div>
                    )
                ) : (
                    pplFoldersList.length === 0 ? (
                        <div className="pp-empty">{t("pplNoFolders")}</div>
                    ) : (
                        pplFoldersList.map(folder => {
                            const pplMenuItems = [
                                {
                                    label: folder.pinned ? t("pplUnpin") : t("pplPin"),
                                    onClick: () => pplHandlePinFolder(folder),
                                    icon: <ColoredIcon icon={PinIcon} size={16} />
                                },
                                { label: t("pplExport"), onClick: () => {}, icon: <ExportIcon width={16} /> }
                            ];

                            return (
                                <div
                                    key={folder.id}
                                    className="module-card"
                                    onClick={() => navigate(`/library/folders/${folder.id}`)}
                                    style={{cursor: "pointer"}}
                                >
                                    <div className="module-info">
                                        <div className="top-row">
                                            <span className="terms-count">{folder.modules_count} {t("mpModulesShort")}</span>
                                        </div>
                                        <div className="module-name-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <ColoredIcon icon={FolderIcon} color={folder.color || "#6366f1"} size={20} />
                                            <span className="folder-name-text">{folder.name}</span>
                                        </div>
                                    </div>
                                    <div className="folder-actions" onClick={e => e.stopPropagation()}>
                                        <DropdownMenu align="left" width={160} items={pplMenuItems}>
                                            <button className="btn-icon">
                                                <DotsIcon width={16} />
                                            </button>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>

            <ModalMessage
                open={pplModalInfo.open}
                type={pplModalInfo.type}
                title={pplModalInfo.title}
                message={pplModalInfo.message}
                onClose={pplHandleCloseModal}
            />
        </div>
    );
}