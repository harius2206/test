import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
    getFolders,
    createFolder,
    deleteFolder,
    updateFolder,
    toggleFolderVisibility,
    getSavedFolders,
    saveFolder,
    unsaveFolder
} from "../../../api/foldersApi";

import EditableField from "../../../components/editableField/editableField";
import ColoredIcon from "../../../components/coloredIcon";
import SortMenu from "../../../components/sortMenu/sortMenu";
import AddUniversalItem from "../../../components/addUniversalItem";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import Button from "../../../components/button/button";

import { ReactComponent as FolderIcon } from "../../../images/folder.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as RenameIcon } from "../../../images/rename.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as ExportIcon } from "../../../images/export.svg";
import { ReactComponent as TickIcon } from "../../../images/tick.svg";
import { ReactComponent as UntickIcon } from "../../../images/unTick.svg";
import { ReactComponent as SaveIcon } from "../../../images/save.svg";

export default function Folders({ addFolder, setAddFolder, source = "library" }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState("");

    const colors = [
        "#ef4444", "#f97316", "#facc15", "#22c55e",
        "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
        "#d946ef", "#ec4899", "#78716c", "#000000"
    ];

    const loadFolders = useCallback(async () => {
        if (!user?.id) { setLoading(false); return; }

        try {
            setLoading(true);
            let response;
            if (source === "saves") {
                response = await getSavedFolders(user.id);
            } else {
                response = await getFolders();
            }
            const data = response.data.results || response.data;

            setFolders(data.map(f => ({
                ...f,
                modules: f.modules_count || 0,
                pinned: f.pinned,
                private: f.visible === "private",
                is_saved: source === "saves" ? true : f.is_saved
            })));
        } catch (error) {
            console.error("Failed to load folders", error);
        } finally {
            setLoading(false);
        }
    }, [user, source]);

    useEffect(() => { loadFolders(); }, [loadFolders]);

    const handleSaveToggle = async (folder) => {
        try {
            if (folder.is_saved) {
                await unsaveFolder(folder.id);
                if (source === "saves") {
                    setFolders(prev => prev.filter(f => f.id !== folder.id));
                } else {
                    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, is_saved: false } : f));
                }
            } else {
                await saveFolder(folder.id);
                setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, is_saved: true } : f));
            }
        } catch (err) {
            alert("Action failed");
        }
    };

    const handleDeleteFolder = async (id) => {
        if (!window.confirm("Delete this folder?")) return;
        try {
            await deleteFolder(id);
            setFolders(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            alert("Error deleting folder");
        }
    };

    const handleUpdate = async (id, data, uiUpdate) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, ...uiUpdate } : f));
        try {
            if (data.visible !== undefined) {
                await toggleFolderVisibility(id, data.visible);
            } else {
                await updateFolder(id, data);
            }
        } catch (error) { loadFolders(); }
    };

    const handleSort = (type) => {
        setFolders(prev => {
            const sorted = [...prev];
            if (type === "date") sorted.sort((a, b) => b.id - a.id);
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            return sorted;
        });
    };

    const saveRename = async (id) => {
        if (!renameValue.trim()) return setRenamingId(null);
        await handleUpdate(id, { name: renameValue.trim() }, { name: renameValue.trim() });
        setRenamingId(null);
    };

    if (loading) return <div style={{ padding: 20, textAlign: "center", width: "100%" }}>Loading folders...</div>;

    return (
        <div className="folders-page">
            <div className="library-controls">
                <SortMenu onSort={handleSort} />
            </div>

            <div className="module-list">
                {source !== "saves" && addFolder && (
                    <AddUniversalItem
                        type="folder"
                        fields={["name", "color"]}
                        icon={FolderIcon}
                        colorOptions={colors}
                        active={addFolder}
                        onClose={() => setAddFolder(false)}
                        onCreate={(val) => {}} // Handle create...
                    />
                )}

                {folders.length === 0 && (
                    <div style={{ padding: 20, color: "gray", textAlign: "center", width: "100%" }}>
                        No folders found.
                    </div>
                )}

                {folders.map(folder => {
                    const isOwn = folder.user?.id === user?.id || !folder.user;
                    const menuItems = [];

                    // Керування (Тільки для власника)
                    if (isOwn) {
                        menuItems.push(
                            { label: folder.pinned ? "Unpin" : "Pin", onClick: () => {}, icon: <ColoredIcon icon={folder.pinned ? TickIcon : UntickIcon} size={16} /> },
                            { label: folder.private ? "Make Public" : "Make Private", onClick: () => handleUpdate(folder.id, { visible: folder.private ? "public" : "private" }, { private: !folder.private }), icon: <ColoredIcon icon={folder.private ? TickIcon : UntickIcon} size={16} /> },
                            { label: "Rename", onClick: () => { setRenamingId(folder.id); setRenameValue(folder.name); }, icon: <ColoredIcon icon={RenameIcon} size={16} /> },
                            { label: "Delete", onClick: () => handleDeleteFolder(folder.id), icon: <ColoredIcon icon={DeleteIcon} size={16} /> }
                        );
                    }

                    // Збереження (Для всіх папок - тепер доступно "в принципі")
                    menuItems.push({
                        label: folder.is_saved ? "Unsave" : "Save",
                        onClick: () => handleSaveToggle(folder),
                        icon: <SaveIcon width={16} height={16} />
                    });

                    menuItems.push({ label: "Export", onClick: () => {}, icon: <ColoredIcon icon={ExportIcon} size={16} /> });

                    return (
                        <div
                            className="module-card"
                            key={folder.id}
                            onClick={() => renamingId !== folder.id && navigate(`/library/folders/${folder.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="module-info">
                                <div className="top-row">
                                    <span className="terms-count">{folder.modules} modules</span>
                                </div>
                                <div className="module-name-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <ColoredIcon icon={FolderIcon} color={folder.color} size={20} />
                                    {renamingId === folder.id ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }} onClick={e => e.stopPropagation()}>
                                            <EditableField value={renameValue} onSave={setRenameValue} editable={true} autosave={true} />
                                            <Button variant="static" width={70} height={30} onClick={() => saveRename(folder.id)}>Save</Button>
                                            <Button variant="hover" width={70} height={30} onClick={() => setRenamingId(null)}>Cancel</Button>
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