import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n";
import {
    getFolders,
    createFolder,
    deleteFolder,
    updateFolder,
    toggleFolderVisibility,
    getSavedFolders,
    saveFolder,
    unsaveFolder,
    pinFolder,
    unpinFolder
} from "../../../api/foldersApi";

import EditableField from "../../../components/editableField/editableField";
import ColoredIcon from "../../../components/coloredIcon";
import SortMenu from "../../../components/sortMenu/sortMenu";
import AddUniversalItem from "../../../components/addUniversalItem";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import Button from "../../../components/button/button";
import UserAvatar from "../../../components/avatar/avatar";
import Loader from "../../../components/loader/loader";

import { ReactComponent as FolderIcon } from "../../../images/folder.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as RenameIcon } from "../../../images/rename.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as SaveIcon } from "../../../images/save.svg";
import { ReactComponent as EyeOpenedIcon } from "../../../images/eyeOpened.svg";
import { ReactComponent as EyeClosedIcon } from "../../../images/eyeClosed.svg";
import { ReactComponent as PinIcon } from "../../../images/pin.svg";

export default function Folders({ addFolder, setAddFolder, source = "library", preloadedFolders, loadingParent, onRefresh }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useI18n();

    const [fFolders, fSetFolders] = useState([]);
    const [fLoading, fSetLoading] = useState(true);
    const [fRenamingId, fSetRenamingId] = useState(null);
    const [fRenameValue, fSetRenameValue] = useState("");

    const fColors = [
        "#ef4444", "#f97316", "#facc15", "#22c55e",
        "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
        "#d946ef", "#ec4899", "#78716c", "#000000"
    ];

    const fLoadFolders = useCallback(async () => {
        if (!user?.id) { fSetLoading(false); return; }

        if (source === "library" && preloadedFolders) {
            if (loadingParent) {
                fSetLoading(true);
                return;
            }
            fSetFolders(preloadedFolders.map(f => ({
                ...f,
                modules: f.modules_count || 0,
                pinned: f.pinned,
                private: f.visible === "private",
                is_saved: f.saved,
                user: f.user
            })));
            fSetLoading(false);
            return;
        }

        try {
            fSetLoading(true);
            let response;
            if (source === "saves") {
                response = await getSavedFolders(user.id);
            } else {
                response = await getFolders();
            }
            const data = response.data.results || response.data;

            fSetFolders(data.map(f => ({
                ...f,
                modules: f.modules_count || 0,
                pinned: f.pinned,
                private: f.visible === "private",
                is_saved: source === "saves" ? true : f.is_saved,
                user: f.user
            })));
        } catch (error) {
            console.error("Failed to load folders", error);
        } finally {
            fSetLoading(false);
        }
    }, [user, source, preloadedFolders, loadingParent]);

    useEffect(() => { fLoadFolders(); }, [fLoadFolders]);

    const fRefreshParentOrLocal = () => {
        if (onRefresh) onRefresh();
        else fLoadFolders();
    };

    const fHandleSaveToggle = async (folder) => {
        const wasSaved = folder.is_saved;
        fSetFolders(prev =>
            source === "saves" && wasSaved
                ? prev.filter(f => f.id !== folder.id)
                : prev.map(f => f.id === folder.id ? { ...f, is_saved: !wasSaved } : f)
        );

        try {
            if (wasSaved) await unsaveFolder(folder.id);
            else await saveFolder(folder.id);
        } catch (err) {
            fLoadFolders();
            alert(t("fActionFailed"));
        }
    };

    const fHandlePinToggle = async (folder) => {
        const isPinned = folder.pinned;
        fSetFolders(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: !isPinned } : f));
        try {
            if (isPinned) await unpinFolder(folder.id);
            else await pinFolder(folder.id);
        } catch (err) {
            fSetFolders(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: isPinned } : f));
            alert(t("fPinActionFailed"));
        }
    };

    const fHandleDeleteFolder = async (id) => {
        if (!window.confirm(t("fDeleteFolderConfirm"))) return;
        try {
            await deleteFolder(id);
            fSetFolders(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            alert(t("fDeleteFolderError"));
        }
    };

    const fHandleUpdate = async (id, data, uiUpdate) => {
        const oldFolders = [...fFolders];
        fSetFolders(prev => prev.map(f => f.id === id ? { ...f, ...uiUpdate } : f));
        try {
            if (data.visible !== undefined) {
                await toggleFolderVisibility(id, data.visible);
            } else {
                await updateFolder(id, data);
            }
        } catch (error) {
            fSetFolders(oldFolders);
        }
    };

    const fHandleSort = (type) => {
        fSetFolders(prev => {
            const sorted = [...prev];
            if (type === "date") sorted.sort((a, b) => b.id - a.id);
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            return sorted;
        });
    };

    const fSaveRename = async (id) => {
        if (!fRenameValue.trim()) return fSetRenamingId(null);
        await fHandleUpdate(id, { name: fRenameValue.trim() }, { name: fRenameValue.trim() });
        fSetRenamingId(null);
    };

    if (fLoading) return <Loader />;

    return (
        <div className="folders-page">
            <div className="library-controls">
                <SortMenu onSort={fHandleSort} />
            </div>

            <div className="module-list">
                {source !== "saves" && addFolder && (
                    <AddUniversalItem
                        type="folder"
                        fields={["name", "color"]}
                        icon={FolderIcon}
                        colorOptions={fColors}
                        active={addFolder}
                        onClose={() => setAddFolder(false)}
                        onCreate={(val) => {
                            createFolder(val).then(() => {
                                setAddFolder(false);
                                fRefreshParentOrLocal();
                            }).catch(() => alert(t("fCreateFolderError")));
                        }}
                    />
                )}

                {fFolders.length === 0 && (
                    <div style={{ padding: 20, color: "gray", textAlign: "center", width: "100%" }}>
                        {t("fNoFoldersFound")}
                    </div>
                )}

                {fFolders.map(folder => {
                    const folderUserId = typeof folder.user === 'object' ? folder.user?.id : folder.user;
                    const isOwn = folderUserId === user?.id || !folderUserId;
                    const authorName = folder.user?.username || "User";
                    const authorAvatar = folder.user?.avatar;

                    const menuItems = [];

                    if (isOwn) {
                        menuItems.push(
                            {
                                label: folder.private ? t("fMakePublicLabel") : t("fMakePrivateLabel"),
                                onClick: () => fHandleUpdate(folder.id, { visible: folder.private ? "public" : "private" }, { private: !folder.private }),
                                icon: <ColoredIcon icon={folder.private ? EyeClosedIcon : EyeOpenedIcon} size={16} />
                            },
                            { label: t("fRenameLabel"), onClick: () => { fSetRenamingId(folder.id); fSetRenameValue(folder.name); }, icon: <ColoredIcon icon={RenameIcon} size={16} /> },
                            {
                                label: folder.pinned ? t("fUnpinLabel") : t("fPinLabel"),
                                onClick: () => fHandlePinToggle(folder),
                                icon: <ColoredIcon icon={PinIcon} size={16} />
                            },
                            { label: t("fDeleteLabel"), onClick: () => fHandleDeleteFolder(folder.id), icon: <ColoredIcon icon={DeleteIcon} size={16} /> }
                        );
                    }

                    menuItems.push({
                        label: folder.is_saved ? t("fUnsaveLabel") : t("fSaveLabel"),
                        onClick: () => fHandleSaveToggle(folder),
                        icon: <SaveIcon width={16} height={16} />
                    });

                    return (
                        <div
                            className="module-card"
                            key={folder.id}
                            onClick={() => fRenamingId !== folder.id && navigate(`/library/folders/${folder.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="module-info">
                                <div className="top-row">
                                    <span className="terms-count">{folder.modules} {t("fModulesLabel")}</span>
                                    {!isOwn && (
                                        <>
                                            <span className="separator">|</span>
                                            <div className="author-block">
                                                <UserAvatar name={authorName} src={authorAvatar} size={20} />
                                                <span className="author">{authorName}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="module-name-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <ColoredIcon icon={FolderIcon} color={folder.color} size={20} />
                                    {fRenamingId === folder.id ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }} onClick={e => e.stopPropagation()}>
                                            <span style={{ flex: 1 }}>
                                                <EditableField value={fRenameValue} onSave={fSetRenameValue} editable={true} autosave={true} />
                                            </span>
                                            <Button variant="static" width={70} height={30} onClick={() => fSaveRename(folder.id)}>{t("fSaveButton")}</Button>
                                            <Button variant="hover" width={70} height={30} onClick={() => fSetRenamingId(null)}>{t("fCancelButton")}</Button>
                                        </div>
                                    ) : (
                                        <span className="folder-name-text">{folder.name}</span>
                                    )}
                                </div>
                            </div>

                            <div className="folder-actions" onClick={e => e.stopPropagation()}>
                                <DropdownMenu align="left" width={180} items={menuItems}>
                                    <button className="btn-icon">
                                        <ColoredIcon icon={DotsIcon} color="#000" size={16} />
                                    </button>
                                </DropdownMenu>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}