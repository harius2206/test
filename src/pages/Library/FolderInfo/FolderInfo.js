import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleCard from "../../../components/ModuleCard/moduleCard";
import SortMenu from "../../../components/sortMenu/sortMenu";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import ColoredIcon from "../../../components/coloredIcon";
import PermissionsMenu from "../../../components/permissionMenu/permissionsMenu";
import EditableField from "../../../components/editableField/editableField";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as DotsIcon } from "../../../images/dots.svg";
import { ReactComponent as EditIcon } from "../../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../../images/delete.svg";
import { ReactComponent as ShareIcon } from "../../../images/share.svg";
import { ReactComponent as TickIcon } from "../../../images/tick.svg";
import { ReactComponent as UntickIcon } from "../../../images/unTick.svg";

import "./folderInfo.css";

export default function FolderPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const folder = state;
    const [folderState, setFolderState] = useState(folder || null);
    const [modules, setModules] = useState(folder?.modulesList || []);
    const [expandedTags, setExpandedTags] = useState({});
    const [visibleCount] = useState(9);

    const [renaming, setRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState("");

    const [permissionsTarget, setPermissionsTarget] = useState(null);

    const usersFallback = [
        { id: 1, name: "ebema", avatar: "", role: "Edit" },
        { id: 2, name: "alex", avatar: "", role: "Review" },
        { id: 3, name: "marta", avatar: "", role: "None" },
    ];

    useEffect(() => {
        setFolderState(folder);
        setModules(folder?.modulesList || []);
    }, [folder]);

    if (!folderState) return <div className="folder-page">Folder not found</div>;

    const toggleTags = (id) =>
        setExpandedTags((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleSort = (type) => {
        let sorted = [...modules];
        if (type === "date") sorted.sort((a, b) => b.id - a.id);
        else if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
        else if (type === "terms") sorted.sort((a, b) => b.terms - a.terms);
        else if (type === "rating") sorted.sort((a, b) => b.rating - a.rating);
        setModules(sorted);
    };

    const handleDelete = () => {
        if (!window.confirm("Delete this folder? This action cannot be undone.")) return;
        navigate(-1);
    };

    const handleTogglePrivate = () => {
        setFolderState((prev) => ({ ...prev, private: !prev.private }));
    };

    const handlePin = () => {
        setFolderState((prev) => ({ ...prev, pinned: !prev.pinned }));
    };

    const handleExport = () => {
        try {
            const data = JSON.stringify(folderState, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const name = folderState.name ? folderState.name.replace(/\s+/g, "_") : `folder_${folderState.id}`;
            a.download = `${name}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    const startRename = () => {
        setRenaming(true);
        setRenameValue(folderState.name);
    };
    const saveRename = () => {
        if (renameValue.trim()) {
            setFolderState((prev) => ({ ...prev, name: renameValue.trim() }));
        }
        setRenaming(false);
    };
    const cancelRename = () => {
        setRenaming(false);
        setRenameValue("");
    };

    const handleRemoveModule = (moduleId) => {
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
    };

    const openModulePermissions = (module) => {
        setPermissionsTarget({
            type: "module",
            id: module.id,
            users: module.users || usersFallback
        });
    };
    const closePermissions = () => setPermissionsTarget(null);

    const updatePermissions = (users) => {
        if (!permissionsTarget) return;
        setModules((prev) =>
            prev.map((m) =>
                m.id === permissionsTarget.id ? { ...m, users } : m
            )
        );
        setPermissionsTarget(null);
    };

    return (
        <div className="folder-page" style={{ position: "relative" }}>
            <button
                onClick={() => navigate(-1)}
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
                        <button
                            className="btn-primary"
                            onClick={saveRename}
                            style={{ height: 36, padding: "6px 14px" }}
                        >
                            Save
                        </button>
                        <button
                            className="btn-primary"
                            onClick={cancelRename}
                            style={{ height: 36, padding: "6px 14px", background: "#fff", color: "#6366f1", border: "1px solid #ccc" }}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <h2 className="folder-title">{folderState.name}</h2>
                )}
            </div>

            <div
                className="folder-controls"
                style={{
                    justifyContent: "space-between",
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center"
                }}
            >
                <SortMenu onSort={handleSort} />

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() =>
                            navigate("/library/create-module", {
                                state: { folderId: folderState.id },
                            })
                        }
                        style={{
                            background: "#6366f1",
                            color: "#fff",
                            border: "none", /* changed: removed white border */
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
                            deleteLabel={"Remove"}
                            onPermissions={() => openModulePermissions(module)}
                            onClick={() => navigate("/library/module-view", { state: { module } })}
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
                        onClose={closePermissions}
                        onSave={updatePermissions}
                    />
                </div>
            )}
        </div>
    );
}