import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFolder, updateFolder, deleteFolder, toggleFolderVisibility, removeModuleFromFolder } from "../../../api/foldersApi";

import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import ColoredIcon from "../../../components/coloredIcon";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import EditableField from "../../../components/editableField/editableField";
import Button from "../../../components/button/button";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as EditIcon } from "../../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as ShareIcon } from "../../../images/share.svg";
import { ReactComponent as TickIcon } from "../../../images/tick.svg";
import { ReactComponent as UntickIcon } from "../../../images/unTick.svg";

import "./folderInfo.css";

// Хелпер для прапорів (з Modules.js)
const getFlagUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

export default function FolderPage() {
    const { id } = useParams(); // Беремо ID з URL
    const navigate = useNavigate();

    const [folderState, setFolderState] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount] = useState(9);
    const [renaming, setRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");
    const [permissionsTarget, setPermissionsTarget] = useState(null);

    // --- Завантаження папки ---
    const loadFolder = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getFolder(id);
            const data = response.data;

            // Мапимо модулі (додаємо прапори, user тощо)
            const mappedModules = (data.modules || []).map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: m.user, // об'єкт юзера
                topic: m.topic,
                cards_count: m.cards_count || (m.cards ? m.cards.length : 0)
            }));

            setFolderState({
                ...data,
                // Адаптація полів
                private: data.visible === "private" || data.private === true
            });
            setModules(mappedModules);
        } catch (err) {
            console.error("Failed to fetch folder", err);
            setError("Folder not found or failed to load.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadFolder();
    }, [loadFolder]);

    const toggleTags = (modId) =>
        setExpandedTags((prev) => ({ ...prev, [modId]: !prev[modId] }));

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

    // --- Actions ---

    const handleDelete = async () => {
        if (!window.confirm("Delete this folder? This action cannot be undone.")) return;
        try {
            await deleteFolder(id);
            navigate("/library"); // Повертаємось у бібліотеку
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete folder");
        }
    };

    const handleTogglePrivate = async () => {
        if (!folderState) return;
        const newPrivacy = !folderState.private;
        const visibleStatus = newPrivacy ? "private" : "public";

        // Оптимістичне оновлення
        setFolderState(prev => ({ ...prev, private: newPrivacy }));

        try {
            await toggleFolderVisibility(id, visibleStatus);
        } catch (err) {
            console.error("Privacy toggle failed", err);
            setFolderState(prev => ({ ...prev, private: !newPrivacy })); // Rollback
        }
    };

    const handlePin = async () => {
        if (!folderState) return;
        const newPinned = !folderState.pinned;
        setFolderState(prev => ({ ...prev, pinned: newPinned }));
        try {
            await updateFolder(id, { pinned: newPinned });
        } catch (err) {
            console.error("Pin failed", err);
            setFolderState(prev => ({ ...prev, pinned: !newPinned }));
        }
    };

    const startRename = () => {
        setRenaming(true);
        setRenameValue(folderState.name);
    };

    const saveRename = async () => {
        if (!renameValue.trim()) return cancelRename();
        try {
            await updateFolder(id, { name: renameValue.trim() });
            setFolderState(prev => ({ ...prev, name: renameValue.trim() }));
            setRenaming(false);
        } catch (err) {
            console.error("Rename failed", err);
        }
    };

    const cancelRename = () => {
        setRenaming(false);
        setRenameValue("");
    };

    const handleRemoveModule = async (moduleId) => {
        if (!window.confirm("Remove module from this folder?")) return;
        try {
            await removeModuleFromFolder(id, moduleId);
            setModules(prev => prev.filter(m => m.id !== moduleId));
        } catch (err) {
            console.error("Remove module failed", err);
        }
    };

    const handleExport = () => {
        // ... (Export logic remains the same)
    };

    const openModulePermissions = (module) => {
        // Placeholder for module permissions
    };

    if (loading) return <div className="folder-page" style={{padding: 20}}>Loading folder...</div>;
    if (error) return <div className="folder-page" style={{padding: 20, color: 'red'}}>{error}</div>;
    if (!folderState) return null;

    return (
        <div className="folder-page" style={{ position: "relative" }}>
            <button
                onClick={() => navigate("/library")}
                style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    zIndex: 2
                }}
                aria-label="Close"
            >
                <CloseIcon width={28} height={28} />
            </button>

            <div className="folder-header">
                {renaming ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <EditableField
                            value={renameValue}
                            onSave={setRenameValue}
                            editable={true}
                            autosave={true}
                        />
                        <Button
                            variant="static"
                            onClick={saveRename}
                            width="90px"
                            height="36px"
                        >
                            Save
                        </Button>
                        <Button
                            variant="hover"
                            onClick={cancelRename}
                            width="90px"
                            height="36px"
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <h2 className="folder-title">{folderState.name}</h2>
                )}
            </div>

            <div className="folder-controls" style={{ justifyContent: "space-between", marginTop: 8, display: "flex", alignItems: "center" }}>
                <SortMenu onSort={handleSort} />

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() => navigate("/library/create-module", { state: { folderId: folderState.id } })}
                        style={{
                            background: "#6366f1",
                            color: "#fff",
                            border: "none",
                            height: 40,
                            minWidth: 140,
                            borderRadius: 6,
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        Add module
                    </button>

                    <DropdownMenu
                        align="right"
                        width={220}
                        items={[
                            { label: "Rename", onClick: startRename, icon: <EditIcon width={16} height={16} /> },
                            { label: "Delete", onClick: handleDelete, icon: <DeleteIcon width={16} height={16} /> },
                            {
                                label: folderState.private ? "Unprivate" : "Private",
                                onClick: handleTogglePrivate,
                                icon: <ColoredIcon icon={folderState.private ? TickIcon : UntickIcon} size={16} />,
                            },
                            {
                                label: folderState.pinned ? "Unpin" : "Pin",
                                onClick: handlePin,
                                icon: <ColoredIcon icon={folderState.pinned ? TickIcon : UntickIcon} size={16} />,
                            },
                            { label: "Export", onClick: handleExport, icon: <ShareIcon width={16} height={16} /> },
                        ]}
                    >
                        <button className="btn-icon" aria-label="Folder menu">
                            <DotsIcon width={16} height={16} />
                        </button>
                    </DropdownMenu>
                </div>
            </div>

            <div className="folder-modules" style={{ marginTop: 16 }}>
                {modules.length > 0 ? (
                    modules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            visibleCount={visibleCount}
                            expanded={!!expandedTags[module.id]}
                            toggleTags={toggleTags}
                            onDelete={handleRemoveModule}
                            deleteLabel={"Remove from folder"}
                            onPermissions={() => openModulePermissions(module)}
                        />
                    ))
                ) : (
                    <div className="empty-folder">No modules yet</div>
                )}
            </div>

            {permissionsTarget && (
                <div style={{ position: "absolute", right: 12, top: 64, zIndex: 300 }}>
                    <PermissionsMenu
                        users={permissionsTarget.users}
                        onClose={() => setPermissionsTarget(null)}
                        onSave={() => setPermissionsTarget(null)}
                    />
                </div>
            )}
        </div>
    );
}