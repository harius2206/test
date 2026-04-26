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

import ColoredIcon from "../../../components/coloredIcon";
import SortMenu from "../../../components/sortMenu/sortMenu";
import AddUniversalItem from "../../../components/addUniversalItem";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import Button from "../../../components/button/button";
import UserAvatar from "../../../components/avatar/avatar";
import Loader from "../../../components/loader/loader";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";

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

    // Стейт для керування модальним вікном
    const [fModalInfo, fSetModalInfo] = useState({ open: false, type: "info", title: "", message: "", onConfirm: null });

    const fHandleCloseModal = () => fSetModalInfo((prev) => ({ ...prev, open: false }));

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
            fSetModalInfo({ open: true, type: "error", title: t("mErrorTitle") || "Error", message: t("fActionFailed") || "Action failed", onConfirm: null });
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
            fSetModalInfo({ open: true, type: "error", title: t("mErrorTitle") || "Error", message: t("fPinActionFailed") || "Pin action failed", onConfirm: null });
        }
    };

    const fHandleDeleteFolder = (id) => {
        fSetModalInfo({
            open: true,
            type: "confirm",
            title: t("fDeleteFolderTitle") || "Delete Folder",
            message: t("fDeleteFolderConfirm"),
            onConfirm: async () => {
                fSetModalInfo(prev => ({ ...prev, open: false }));
                try {
                    await deleteFolder(id);
                    fSetFolders(prev => prev.filter(f => f.id !== id));
                } catch (error) {
                    setTimeout(() => {
                        fSetModalInfo({
                            open: true,
                            type: "error",
                            title: t("mErrorTitle") || "Error",
                            message: t("fDeleteFolderError"),
                            onConfirm: null
                        });
                    }, 300);
                }
            }
        });
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
            fSetModalInfo({ open: true, type: "error", title: t("mErrorTitle") || "Error", message: t("fActionFailed") || "Update failed", onConfirm: null });
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
                            const payload = { ...val };
                            if (payload.name && payload.name.length > 50) {
                                payload.name = payload.name.substring(0, 50);
                            }
                            if (!payload.color) {
                                payload.color = "#6366f1";
                            }
                            createFolder(payload).then(() => {
                                setAddFolder(false);
                                fRefreshParentOrLocal();
                            }).catch(() => {
                                fSetModalInfo({ open: true, type: "error", title: t("mErrorTitle") || "Error", message: t("fCreateFolderError"), onConfirm: null });
                            });
                        }}
                    />
                )}

                {fFolders.length === 0 && (
                    <div style={{ padding: 40, color: "gray", textAlign: "center", width: "100%", gridColumn: "1 / -1" }}>
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

                    const displayFolderName = folder.name && folder.name.length > 15
                        ? folder.name.substring(0, 20) + "..."
                        : folder.name;

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
                                <div className="module-name-row" style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                    <ColoredIcon icon={FolderIcon} color={folder.color} size={20} />

                                    {fRenamingId === folder.id ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, flexWrap: "wrap", minWidth: 0 }} onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                value={fRenameValue}
                                                maxLength={50}
                                                onChange={e => fSetRenameValue(e.target.value.substring(0, 50))}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') fSaveRename(folder.id);
                                                    if (e.key === 'Escape') fSetRenamingId(null);
                                                }}
                                                style={{
                                                    flex: "1 1 120px",
                                                    width: "100%",
                                                    padding: "6px 10px",
                                                    borderRadius: "6px",
                                                    border: "1px solid #6366f1",
                                                    background: "var(--clr-card-bg, #fff)",
                                                    color: "var(--clr-text, #333)",
                                                    fontSize: "14px",
                                                    outline: "none",
                                                    boxSizing: "border-box"
                                                }}
                                            />
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <Button variant="static" width="auto" height="30px" onClick={() => fSaveRename(folder.id)}>
                                                    <span style={{ fontSize: "13px", padding: "0 8px" }}>{t("fSaveButton")}</span>
                                                </Button>
                                                <Button variant="hover" width="auto" height="30px" onClick={() => fSetRenamingId(null)}>
                                                    <span style={{ fontSize: "13px", padding: "0 8px" }}>{t("fCancelButton")}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="folder-name-text" style={{
                                            flex: 1,
                                            minWidth: 0,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            padding: "4px 0"
                                        }}>
                                            {displayFolderName}
                                        </span>
                                    )}

                                </div>
                            </div>

                            <div className="folder-actions" onClick={e => e.stopPropagation()}>
                                <DropdownMenu align="left" width="max-content" items={menuItems}>
                                    <button className="btn-icon">
                                        <ColoredIcon icon={DotsIcon} color="#000" size={16} />
                                    </button>
                                </DropdownMenu>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ModalMessage
                open={fModalInfo.open}
                type={fModalInfo.type}
                title={fModalInfo.title}
                message={fModalInfo.message}
                onClose={fHandleCloseModal}
                onConfirm={fModalInfo.onConfirm}
            />
        </div>
    );
}