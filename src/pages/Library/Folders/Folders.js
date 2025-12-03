import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getUserDetails } from "../../../api/usersApi";
import { createFolder, deleteFolder, updateFolder, toggleFolderVisibility } from "../../../api/foldersApi";

import EditableField from "../../../components/editableField/editableField";
import ColoredIcon from "../../../components/coloredIcon";
import SortMenu from "../../../components/sortMenu/sortMenu";
import AddUniversalItem from "../../../components/addUniversalItem";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";

import { ReactComponent as FolderIcon } from "../../../images/folder.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as RenameIcon } from "../../../images/rename.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as ExportIcon } from "../../../images/export.svg";
import { ReactComponent as TickIcon } from "../../../images/tick.svg";
import { ReactComponent as UntickIcon } from "../../../images/unTick.svg";

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

    // --- Завантаження даних ---
    const loadFolders = useCallback(async () => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }

        if (source === "saves") {
            setFolders([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getUserDetails(user.id);
            const userFolders = response.data.folders || [];

            const mappedFolders = userFolders.map(f => ({
                ...f,
                modules: f.modules_count || 0,
                pinned: f.pinned,
                private: f.visible === "private" || f.private === true
            }));

            setFolders(mappedFolders);
        } catch (error) {
            console.error("Failed to load folders", error);
        } finally {
            setLoading(false);
        }
    }, [user, source]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    // --- Create ---
    const handleCreateFolder = async (newValues) => {
        try {
            const payload = {
                name: newValues.name,
                color: newValues.color || "#6366f1",
            };
            const response = await createFolder(payload);
            const created = response.data;

            setFolders(prev => [{
                ...created,
                modules: 0,
                pinned: false,
                private: false
            }, ...prev]);

            setAddFolder(false);
        } catch (error) {
            console.error("Create folder failed", error);
            alert("Failed to create folder");
        }
    };

    // --- Delete ---
    const handleDeleteFolder = async (id) => {
        if (!window.confirm("Delete this folder?")) return;
        if (source === "saves") return;

        try {
            await deleteFolder(id);
            setFolders(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error("Delete folder failed", error);
            alert("Failed to delete folder");
        }
    };

    // --- Update ---
    const handleUpdate = async (id, data, uiOptimisticUpdate) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, ...uiOptimisticUpdate } : f));

        try {
            if (data.visible !== undefined) {
                await toggleFolderVisibility(id, data.visible);
            } else {
                await updateFolder(id, data);
            }
        } catch (error) {
            console.error("Update folder failed", error);
            loadFolders();
        }
    };

    const handleSort = (type) => {
        setFolders(prev => {
            const sorted = [...prev];
            if (type === "date") sorted.sort((a, b) => b.id - a.id);
            if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
            return sorted;
        });
    };

    // --- Rename ---
    const startRenaming = (folder) => {
        if (source === "saves") return;
        setRenamingId(folder.id);
        setRenameValue(folder.name);
    };

    const saveRename = async (id) => {
        if (!renameValue.trim()) return cancelRename();
        await handleUpdate(id, { name: renameValue.trim() }, { name: renameValue.trim() });
        cancelRename();
    };

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue("");
    };

    // [FIX] Центрування напису завантаження
    if (loading) {
        return <div style={{ padding: 20, textAlign: "center", width: "100%" }}>Loading folders...</div>;
    }

    return (
        <div className="folders-page">
            <div className="library-controls">
                <SortMenu onSort={handleSort} />
            </div>

            <div className="module-list">
                {source === "library" && addFolder && (
                    <AddUniversalItem
                        type="folder"
                        fields={["name", "color"]}
                        icon={FolderIcon}
                        colorOptions={colors}
                        defaultValues={{ color: "#6366f1" }}
                        active={addFolder}
                        onClose={() => setAddFolder(false)}
                        onCreate={handleCreateFolder}
                    />
                )}

                {folders.length === 0 && !addFolder && (
                    <div style={{ padding: 20, color: "gray", textAlign: "center", width: "100%" }}>
                        {source === "saves" ? "No saved folders." : "You haven't created any folders yet."}
                    </div>
                )}

                {folders.map(folder => (
                    <div
                        className="module-card"
                        key={folder.id}
                        onClick={() => {
                            if (renamingId !== folder.id) {
                                navigate(`/library/folders/${folder.id}`, { state: folder });
                            }
                        }}
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
                                        <EditableField
                                            value={renameValue}
                                            onSave={setRenameValue}
                                            editable={true}
                                            autosave={true}
                                            placeholder="Folder name"
                                        />
                                        <button className="btn-primary" onClick={() => saveRename(folder.id)}>Save</button>
                                        <button className="btn-secondary" onClick={cancelRename}>Cancel</button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                                        <span className="folder-name-text">{folder.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="folder-actions" onClick={e => e.stopPropagation()}>
                            <DropdownMenu
                                align="left"
                                width={180}
                                items={[
                                    {
                                        label: folder.pinned ? "Unpin" : "Pin",
                                        onClick: () => handleUpdate(folder.id, { pinned: !folder.pinned }, { pinned: !folder.pinned }),
                                        icon: <ColoredIcon icon={folder.pinned ? TickIcon : UntickIcon} size={16} />
                                    },
                                    {
                                        label: folder.private ? "Unprivate" : "Private",
                                        onClick: () => {
                                            const newPrivacy = !folder.private;
                                            const visibleStatus = newPrivacy ? "private" : "public";
                                            handleUpdate(folder.id, { visible: visibleStatus }, { private: newPrivacy });
                                        },
                                        icon: <ColoredIcon icon={folder.private ? TickIcon : UntickIcon} size={16} />
                                    },
                                    {
                                        label: "Rename",
                                        onClick: () => startRenaming(folder),
                                        icon: <ColoredIcon icon={RenameIcon} size={16} />
                                    },
                                    {
                                        label: "Delete",
                                        onClick: () => handleDeleteFolder(folder.id),
                                        icon: <ColoredIcon icon={DeleteIcon} size={16} />
                                    },
                                    {
                                        label: "Export",
                                        onClick: () => console.log("Export implementation pending"),
                                        icon: <ColoredIcon icon={ExportIcon} size={16} />
                                    }
                                ]}
                            >
                                <button className="btn-icon" aria-label="Folder menu">
                                    <ColoredIcon icon={DotsIcon} color="#000" size={16} />
                                </button>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}