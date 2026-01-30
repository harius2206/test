import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails } from "../../../api/usersApi";
import {
    saveModule,
    unsaveModule,
    pinModule,
    unpinModule
} from "../../../api/modulesApi";
import {
    pinFolder,
    unpinFolder
} from "../../../api/foldersApi";
import { useAuth } from "../../../context/AuthContext";

import UserAvatar from "../../../components/avatar/avatar";
import SortMenu from "../../../components/sortMenu/sortMenu";
import ModuleCard from "../../../components/ModuleCard/moduleCard";
import ColoredIcon from "../../../components/coloredIcon";
import DropdownMenu from "../../../components/dropDownMenu/dropDownMenu";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";

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

    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("modules");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalInfo, setModalInfo] = useState({ open: false, type: "info", title: "", message: "" });

    // Стейт для списків контенту
    const [modulesList, setModulesList] = useState([]);
    const [foldersList, setFoldersList] = useState([]);

    const handleCloseModal = () => setModalInfo(prev => ({ ...prev, open: false }));

    const loadProfile = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getUserDetails(id);
            const data = res.data;

            // === ФІЛЬТРАЦІЯ ДОСТУПУ ===
            const hasAccess = (item) => {
                if (item.visible === "public") return true;
                if (currentUser && String(currentUser.id) === String(data.id)) return true;
                if (currentUser && item.collaborators && item.collaborators.some(c => String(c.id) === String(currentUser.id))) {
                    return true;
                }
                if (item.user_perm) return true;
                return false;
            };

            const allowedModules = (data.modules || []).filter(hasAccess);
            const allowedFolders = (data.folders || []).filter(hasAccess);
            // ============================

            // === ПІДРАХУНОК РЕЙТИНГУ ===
            let calculatedRating = parseFloat(data.avg_rate || 0);
            if (calculatedRating === 0 && allowedModules.length > 0) {
                const ratedModules = allowedModules.filter(m => m.avg_rate && parseFloat(m.avg_rate) > 0);
                if (ratedModules.length > 0) {
                    const sum = ratedModules.reduce((acc, m) => acc + parseFloat(m.avg_rate), 0);
                    calculatedRating = sum / ratedModules.length;
                }
            }

            setUserData({ ...data, avg_rate: calculatedRating });

            // Мапінг модулів
            const mappedModules = allowedModules.map(m => ({
                ...m,
                rating: m.avg_rate,
                flagFrom: getFlagUrl(m.lang_from?.flag),
                flagTo: getFlagUrl(m.lang_to?.flag),
                user: { id: data.id, username: data.username, avatar: data.avatar },
                topic: m.topic,
                cards_count: m.cards_count !== undefined ? m.cards_count : (m.cards ? m.cards.length : 0),
                collaborators: m.collaborators || [],
                is_saved: m.saved,
                pinned: m.pinned // Якщо бекенд повертає статус піна
            }));
            setModulesList(mappedModules);

            // Мапінг папок
            const mappedFolders = allowedFolders.map(f => ({
                ...f,
                modules_count: f.modules_count || (f.modules ? f.modules.length : 0),
                user: { id: data.id, username: data.username, avatar: data.avatar },
                is_saved: f.saved,
                pinned: f.pinned // Якщо бекенд повертає статус піна
            }));
            setFoldersList(mappedFolders);

            setError(null);

        } catch (err) {
            console.error("Failed to load profile", err);
            setError("User not found or connection error.");
        } finally {
            setLoading(false);
        }
    }, [id, currentUser]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSort = (type) => {
        if (activeTab === "modules") {
            setModulesList(prev => {
                const sorted = [...prev];
                if (type === "date") sorted.sort((a, b) => b.id - a.id);
                if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
                if (type === "rating") sorted.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
                return sorted;
            });
        } else {
            setFoldersList(prev => {
                const sorted = [...prev];
                if (type === "date") sorted.sort((a, b) => b.id - a.id);
                if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
                return sorted;
            });
        }
    };

    // --- Module Actions ---
    const handleSaveModule = async (modId) => {
        try {
            await saveModule(modId);
            setModulesList(prev => prev.map(m => m.id === modId ? { ...m, is_saved: true } : m));
            setModalInfo({ open: true, type: "success", title: "Saved", message: "Module saved successfully." });
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to save module." });
        }
    };

    const handleUnsaveModule = async (modId) => {
        try {
            await unsaveModule(modId);
            setModulesList(prev => prev.map(m => m.id === modId ? { ...m, is_saved: false } : m));
        } catch (err) {
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to unsave module." });
        }
    };

    const handlePinModule = async (modId) => {
        setModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: true } : m));
        try {
            await pinModule(modId);
        } catch (err) {
            setModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: false } : m));
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to pin module." });
        }
    };

    const handleUnpinModule = async (modId) => {
        setModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: false } : m));
        try {
            await unpinModule(modId);
        } catch (err) {
            setModulesList(prev => prev.map(m => m.id === modId ? { ...m, pinned: true } : m));
            setModalInfo({ open: true, type: "error", title: "Error", message: "Failed to unpin module." });
        }
    };

    // --- Folder Actions ---
    const handlePinFolder = async (folder) => {
        const isPinned = folder.pinned;
        setFoldersList(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: !isPinned } : f));
        try {
            if (isPinned) {
                await unpinFolder(folder.id);
            } else {
                await pinFolder(folder.id);
            }
        } catch (err) {
            setFoldersList(prev => prev.map(f => f.id === folder.id ? { ...f, pinned: isPinned } : f));
            setModalInfo({ open: true, type: "error", title: "Error", message: "Pin action failed." });
        }
    };

    if (loading) return <div className="pp-container" style={{textAlign:"center", paddingTop:40}}>Loading profile...</div>;
    if (error) return <div className="pp-container" style={{textAlign:"center", paddingTop:40, color:"red"}}>{error}</div>;
    if (!userData) return null;

    const displayRating = userData.avg_rate
        ? parseFloat(userData.avg_rate).toFixed(1)
        : "0.0";

    return (
        <div className="pp-container">
            {/* Header */}
            <div className="pp-header">
                <div className="pp-user-info">
                    <UserAvatar
                        src={getFlagUrl(userData.avatar)}
                        name={userData.username}
                        size={80}
                        fontSize={32}
                        disableStrictFallback={true}
                    />
                    <div className="pp-text-info">
                        <div className="pp-username-row">
                            <h2 className="pp-username">{userData.username}</h2>
                            <div className="pp-rating-badge">
                                {displayRating} <StarIcon className="pp-star-icon" />
                            </div>
                        </div>
                        <p className="pp-bio">{userData.bio || "No bio provided."}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="pp-tabs">
                <button
                    className={`pp-tab ${activeTab === "modules" ? "active" : ""}`}
                    onClick={() => setActiveTab("modules")}
                >
                    Modules ({modulesList.length})
                </button>
                <button
                    className={`pp-tab ${activeTab === "folders" ? "active" : ""}`}
                    onClick={() => setActiveTab("folders")}
                >
                    Folders ({foldersList.length})
                </button>
            </div>

            {/* Controls */}
            <div className="pp-controls">
                <SortMenu onSort={handleSort} />
            </div>

            {/* Content List */}
            <div className="pp-content-list">
                {activeTab === "modules" ? (
                    modulesList.length === 0 ? (
                        <div className="pp-empty">No accessible modules found.</div>
                    ) : (
                        <div className="module-list">
                            {modulesList.map((module) => (
                                <ModuleCard
                                    key={module.id}
                                    module={module}
                                    onSave={handleSaveModule}
                                    onUnsave={handleUnsaveModule}
                                    onPin={handlePinModule}
                                    onUnpin={handleUnpinModule}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    foldersList.length === 0 ? (
                        <div className="pp-empty">No accessible folders found.</div>
                    ) : (
                        foldersList.map(folder => {
                            // Формуємо меню для папки
                            const menuItems = [
                                {
                                    label: folder.pinned ? "Unpin" : "Pin",
                                    onClick: () => handlePinFolder(folder),
                                    icon: <ColoredIcon icon={PinIcon} size={16} />
                                },
                                { label: "Export", onClick: () => {}, icon: <ExportIcon width={16} /> }
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
                                            <span className="terms-count">{folder.modules_count} modules</span>
                                        </div>
                                        <div className="module-name-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <ColoredIcon icon={FolderIcon} color={folder.color || "#6366f1"} size={20} />
                                            <span className="folder-name-text">{folder.name}</span>
                                        </div>
                                    </div>
                                    <div className="folder-actions" onClick={e => e.stopPropagation()}>
                                        <DropdownMenu align="left" width={160} items={menuItems}>
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
                open={modalInfo.open}
                type={modalInfo.type}
                title={modalInfo.title}
                message={modalInfo.message}
                onClose={handleCloseModal}
            />
        </div>
    );
}