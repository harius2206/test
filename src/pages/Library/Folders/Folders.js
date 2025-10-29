import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

    // --- базові дані бібліотеки ---
    const [folders, setFolders] = useState([
        {
            id: 1,
            name: "Polisz",
            color: "#ef4444",
            modules: 15,
            pinned: false,
            private: false,
            modulesList: [
                { id: 1, name: "Polisz", terms: 150, author: "admin", rating: 4.2, tags: ["mgr1", "litery", "slowa"] },
                { id: 2, name: "Aolisz 2.0", terms: 360, author: "adam", rating: 3.4, tags: ["mgr2", "litery", "slowa", "exam"] }
            ]
        },
        {
            id: 2,
            name: "Angielski",
            color: "#3b82f6",
            modules: 0,
            pinned: false,
            private: false,
            modulesList: []
        }
    ]);

    // --- збережені папки ---
    const savedFolders = [
        {
            id: 101,
            name: "Saved: Biology",
            color: "#22c55e",
            modules: 3,
            pinned: true,
            private: false,
            modulesList: [
                { id: 1, name: "Cells", terms: 40, author: "admin", rating: 4.7, tags: ["science", "bio"] }
            ]
        },
        {
            id: 102,
            name: "Saved: Geography",
            color: "#06b6d4",
            modules: 5,
            pinned: false,
            private: false,
            modulesList: []
        }
    ];

    // 🔄 використовуємо дані залежно від джерела
    const data = source === "saves" ? savedFolders : folders;

    const [colorMenuOpen, setColorMenuOpen] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const colorMenuRef = useRef(null);

    const colors = [
        "#ef4444", "#f97316", "#facc15", "#22c55e",
        "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
        "#d946ef", "#ec4899", "#78716c", "#000000"
    ];

    const handleDeleteFolder = (id) => {
        if (!window.confirm("Delete this folder?")) return;
        if (source === "saves") return; // у сейвах видалення не дозволене
        setFolders(prev => prev.filter(f => f.id !== id));
    };

    const handleSort = (type) => {
        const setter = source === "saves" ? () => {} : setFolders;
        if (type === "date") setter(prev => [...prev].sort((a, b) => b.id - a.id));
        if (type === "name") setter(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const startRenaming = (folder) => {
        if (source === "saves") return; // у сейвах не редагуємо
        setRenamingId(folder.id);
        setRenameValue(folder.name);
    };

    const saveRename = (id) => {
        if (!renameValue.trim()) return cancelRename();
        setFolders(prev => prev.map(f => (f.id === id ? { ...f, name: renameValue.trim() } : f)));
        cancelRename();
    };

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue("");
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) {
                setColorMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                        onCreate={(newValues) => {
                            const newFolder = {
                                id: Date.now(),
                                name: newValues.name,
                                color: newValues.color || "#6366f1",
                                modules: 0,
                                pinned: false,
                                private: false,
                                modulesList: []
                            };
                            setFolders(prev => [newFolder, ...prev]);
                            setAddFolder(false);
                        }}
                    />
                )}

                {data.map(folder => (
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
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
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
                                        onClick: () =>
                                            setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: !f.pinned } : f)),
                                        icon: <ColoredIcon icon={folder.pinned ? TickIcon : UntickIcon} size={16} />
                                    },
                                    {
                                        label: folder.private ? "Unprivate" : "Private",
                                        onClick: () =>
                                            setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, private: !f.private } : f)),
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
                                        onClick: () => {},
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
