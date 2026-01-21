import React from "react";
import UserAvatar from "../avatar/avatar";
import DropdownMenu from "../dropDownMenu/dropDownMenu";
import { useNavigate } from "react-router-dom";
import DiagonalFlagRect43 from "../diagonalFlagRect43";
import { useAuth } from "../../context/AuthContext";

import { ReactComponent as DotsIcon } from "../../images/dots.svg";
import { ReactComponent as StarIcon } from "../../images/star.svg";
import { ReactComponent as EditIcon } from "../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../images/delete.svg";
import { ReactComponent as ShareIcon } from "../../images/share.svg";
import { ReactComponent as MoreIcon } from "../../images/dotsHorizontal.svg";
import { ReactComponent as CloseIcon } from "../../images/close.svg";
import { ReactComponent as FolderIcon } from "../../images/folder.svg";
import { ReactComponent as MergeIcon } from "../../images/merge.svg";
import { ReactComponent as SaveIcon } from "../../images/save.svg";
// Імпорт іконок очей
import { ReactComponent as EyeOpenedIcon } from "../../images/eyeOpened.svg";
import { ReactComponent as EyeClosedIcon } from "../../images/eyeClosed.svg";

import "./moduleCard.css";

export default function ModuleCard({
                                       module,
                                       visibleCount = 3,
                                       expanded,
                                       toggleTags,
                                       onDelete,
                                       deleteLabel = "Delete",
                                       onEdit,
                                       onPermissions,
                                       onAddToFolder,
                                       onMerge,
                                       isMergeMode,
                                       isSelected,
                                       onSelect,
                                       onSave,
                                       onUnsave,
                                       onVisibilityToggle // Новий проп
                                   }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const tags = module.tags || [];
    const showMore = tags.length > visibleCount;
    const visibleTags = expanded ? tags : tags.slice(0, visibleCount);

    const authorName = module.user?.username || module.author || "User";

    // Перейменував для ясності, але головне - передати disableStrictFallback
    const displayAuthorAvatar = module.user?.avatar || module.avatar;

    const termsCount = module.cards_count !== undefined ? module.cards_count : (module.terms || 0);
    const topicName = typeof module.topic === 'object' && module.topic ? module.topic.name : module.topic;

    const isOwnModule = (module.user?.id && user?.id && String(module.user.id) === String(user.id)) || (user?.username === authorName);

    // Перевірка прав редагування: власник або має права "editor"
    const canEdit = isOwnModule || (module.user_perm === "editor");

    const handleCardClick = () => {
        if (isMergeMode) {
            if (onSelect) onSelect(module);
        } else {
            navigate(`/library/module-view?id=${module.id}`);
        }
    };

    const menuItems = [];

    // Редагування
    if (onEdit) {
        menuItems.push({
            label: "Edit",
            onClick: (e, trigger) => onEdit(module, e, trigger),
            icon: <EditIcon width={16} height={16} />
        });
    } else if (isOwnModule) {
        menuItems.push({
            label: "Edit",
            onClick: () => navigate("/library/create-module", { state: { mode: "edit", moduleId: module.id, moduleData: module } }),
            icon: <EditIcon width={16} height={16} />
        });
    }

    // --- VISIBILITY TOGGLE (Тільки для власників/редакторів) ---
    if (onVisibilityToggle && canEdit) {
        const isPrivate = module.visible === "private";
        menuItems.push({
            label: isPrivate ? "Make Public" : "Make Private",
            onClick: () => onVisibilityToggle(module),
            icon: isPrivate ? <EyeClosedIcon width={16} height={16} /> : <EyeOpenedIcon width={16} height={16} />
        });
    }

    // Збереження
    if (module.is_saved && onUnsave) {
        menuItems.push({
            label: "Unsave",
            onClick: () => onUnsave(module.id),
            icon: <SaveIcon width={16} height={16} />
        });
    } else if (!module.is_saved && onSave) {
        menuItems.push({
            label: "Save",
            onClick: () => onSave(module.id),
            icon: <SaveIcon width={16} height={16} />
        });
    }

    if (onPermissions) {
        menuItems.push({
            label: "Permissions",
            onClick: (e, trigger) => onPermissions(module, e, trigger),
            icon: <ShareIcon width={16} height={16} />
        });
    }

    if (onAddToFolder) {
        menuItems.push({
            label: "Add to folder",
            onClick: (e, trigger) => onAddToFolder(module, e, trigger),
            icon: <FolderIcon width={16} height={16} />
        });
    }

    if (onMerge) {
        menuItems.push({
            label: isMergeMode ? "Cancel Merge" : "Merge",
            onClick: () => onMerge(module),
            icon: <MergeIcon width={16} height={16} />
        });
    }

    if (onDelete) {
        menuItems.push({
            label: deleteLabel,
            onClick: () => onDelete(module.id),
            icon: <DeleteIcon width={16} height={16} />
        });
    }

    return (
        <div
            className={`module-card ${isSelected ? 'selected' : ''}`}
            onClick={handleCardClick}
            style={{
                cursor: "pointer",
                borderColor: isSelected ? "#6366f1" : "#e5e7eb",
                borderWidth: "1px",
                borderStyle: "solid",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                boxShadow: isSelected ? "0 0 8px rgba(99, 102, 241, 0.2)" : "none"
            }}
        >
            <div className="module-info">
                <div className="top-row">
                    <span className="terms-count">{termsCount} terms</span>
                    {!isOwnModule && (
                        <>
                            <span className="separator">|</span>
                            <div className="author-block">
                                {/* ДОДАНО disableStrictFallback={true}, ЩОБ НЕ ПІДТЯГУВАЛО АВАТАР ПОТОЧНОГО ЮЗЕРА */}
                                <UserAvatar
                                    name={authorName}
                                    src={displayAuthorAvatar}
                                    size={20}
                                    disableStrictFallback={true}
                                />
                                <span className="author">{authorName}</span>
                            </div>
                        </>
                    )}
                    {module.rating > 0 && (
                        <>
                            <span className="separator">|</span>
                            <span className="rating">{module.rating}<StarIcon className="mc-star-icon" /></span>
                        </>
                    )}
                    <div className="mc-tags-wrapper">
                        <div className="mc-tags-row">
                            {visibleTags.map((tag, i) => <span key={i} className="mc-tag">{tag}</span>)}
                            {showMore && (
                                <a onClick={(e) => { e.stopPropagation(); toggleTags && toggleTags(module.id); }} className="tags-dots" style={{ cursor: "pointer" }}>
                                    {expanded ? <CloseIcon width={14} height={14} /> : <MoreIcon width={14} height={14} />}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="module-name-row hover-wrapper">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                        <span className="module-name-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {topicName ? `${module.name} - ${topicName}` : module.name}
                        </span>
                        {(module.flagFrom || module.flagTo) && (
                            <div style={{ flexShrink: 0 }}>
                                <DiagonalFlagRect43 flag1={module.flagFrom} flag2={module.flagTo} width={16} height={12} />
                            </div>
                        )}
                    </div>
                    <span className="hover-hint">{module.description || "No description"}</span>
                </div>
            </div>
            {menuItems.length > 0 && (
                <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu align="left" width={180} items={menuItems}>
                        <button className="btn-icon"><DotsIcon width={16} height={16} /></button>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}