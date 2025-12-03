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

import "./moduleCard.css";

export default function ModuleCard({
                                       module,
                                       visibleCount = 3,
                                       expanded,
                                       toggleTags,
                                       onDelete,
                                       deleteLabel = "Delete",
                                       onPermissions,
                                       onAddToFolder // Новий проп
                                   }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const tags = module.tags || [];
    const showMore = tags.length > visibleCount;
    const visibleTags = expanded ? tags : tags.slice(0, visibleCount);

    // === Адаптація даних ===
    const authorName = module.user?.username || module.author || "User";
    const authorAvatar = module.user?.avatar || module.avatar;
    const termsCount = module.cards_count !== undefined ? module.cards_count : (module.terms || 0);

    const topicName = typeof module.topic === 'object' && module.topic !== null
        ? module.topic.name
        : module.topic;

    const isOwnModule = user?.username === authorName;
    const flag1 = module.flagFrom;
    const flag2 = module.flagTo;

    // === ОБРОБНИКИ ===

    const handleCardClick = () => {
        navigate(`/library/module-view?id=${module.id}`);
    };

    const handleEditClick = (e) => {
        navigate("/library/create-module", {
            state: {
                mode: "edit",
                moduleId: module.id,
                moduleData: module
            }
        });
    };

    // Формуємо пункти меню
    const menuItems = [];

    // Редагування доступне тільки власнику
    if (isOwnModule) {
        menuItems.push({
            label: "Edit",
            onClick: handleEditClick,
            icon: <EditIcon width={16} height={16} />
        });
    }

    // "Add to folder" - доступно, якщо передано обробник (зазвичай для своїх модулів або збережених)
    if (onAddToFolder) {
        menuItems.push({
            label: "Add to folder",
            onClick: (evt, trigger) => onAddToFolder(module, evt, trigger),
            icon: <FolderIcon width={16} height={16} /> // Можна використати FolderIcon або іншу іконку
        });
    }

    // Видалення
    if (onDelete) {
        menuItems.push({
            label: deleteLabel,
            onClick: () => onDelete(module.id),
            icon: <DeleteIcon width={16} height={16} />
        });
    }

    // Права доступу (Permissions)
    if (onPermissions && isOwnModule) {
        menuItems.push({
            label: "Permissions",
            onClick: (evt, trigger) => onPermissions(module, evt, trigger),
            icon: <ShareIcon width={16} height={16} />
        });
    }

    return (
        <div className="module-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
            <div className="module-info">
                <div className="top-row">
                    <span className="terms-count">{termsCount} terms</span>

                    {!isOwnModule && (
                        <>
                            <span className="separator">|</span>
                            <div className="author-block">
                                <UserAvatar name={authorName} avatar={authorAvatar} size={20} />
                                <span className="author">{authorName}</span>
                            </div>
                        </>
                    )}

                    {module.rating && (
                        <>
                            <span className="separator">|</span>
                            <span className="rating">
                                {module.rating}
                                <StarIcon className="mc-star-icon" />
                            </span>
                        </>
                    )}

                    <div className="mc-tags-wrapper">
                        <div className="mc-tags-row">
                            {visibleTags.map((tag, i) => (
                                <span key={i} className="mc-tag">{tag}</span>
                            ))}

                            {showMore && (
                                <a
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTags && toggleTags(module.id);
                                    }}
                                    className="tags-dots"
                                    style={{ cursor: "pointer" }}
                                >
                                    {expanded
                                        ? <CloseIcon width={14} height={14} />
                                        : <MoreIcon width={14} height={14} />}
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

                        {(flag1 || flag2) && (
                            <div style={{ flexShrink: 0 }}>
                                <DiagonalFlagRect43 flag1={flag1} flag2={flag2} width={16} height={12} />
                            </div>
                        )}
                    </div>
                    <span className="hover-hint">{module.description || "No description"}</span>
                </div>
            </div>

            <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu
                    align="left"
                    width={180}
                    items={menuItems}
                >
                    <button className="btn-icon" aria-label="Module menu">
                        <DotsIcon width={16} height={16} />
                    </button>
                </DropdownMenu>
            </div>
        </div>
    );
}