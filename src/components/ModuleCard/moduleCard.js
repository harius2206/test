import React from "react";
import UserAvatar from "../avatar/avatar";
import DropdownMenu from "../dropDownMenu/dropDownMenu";
import { useNavigate } from "react-router-dom";

import { ReactComponent as DotsIcon } from "../../images/dots.svg";
import { ReactComponent as StarIcon } from "../../images/star.svg";
import { ReactComponent as EditIcon } from "../../images/editImg.svg";
import { ReactComponent as DeleteIcon } from "../../images/delete.svg";
import { ReactComponent as ShareIcon } from "../../images/share.svg";

import "./moduleCard.css";

export default function ModuleCard({
                                       module,
                                       visibleCount,
                                       expanded,
                                       toggleTags,
                                       onDelete,
                                       deleteLabel = "Delete",
                                       onPermissions,
                                       onClick
                                   }) {
    const showMore = module.tags.length > visibleCount;
    const visibleTags = expanded ? module.tags : module.tags.slice(0, visibleCount);
    const navigate = useNavigate();

    return (
        <div className="module-card" onClick={onClick} style={{ cursor: "pointer" }}>
            <div className="module-info">
                <div className="top-row">
                    <span className="terms-count">{module.terms} terms</span>
                    <span className="separator">|</span>
                    <div className="author-block">
                        <UserAvatar name={module.author} avatar={module.avatar} size={20} />
                        <span className="author">{module.author}</span>
                    </div>
                    <span className="separator">|</span>
                    <span className="rating">
                        {module.rating}
                        <StarIcon className="star-icon" />
                    </span>
                    <div className="tags-row">
                        {visibleTags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                        ))}
                        {showMore && !expanded && (
                            <a onClick={(e) => { e.stopPropagation(); toggleTags(module.id); }} className="tags-dots" style={{ cursor: "pointer" }}>...</a>
                        )}
                        {showMore && expanded && (
                            <a onClick={(e) => { e.stopPropagation(); toggleTags(module.id); }} className="tags-dots" style={{ cursor: "pointer" }}>▲</a>
                        )}
                    </div>
                </div>
                <div className="module-name-row">
                    <span className="module-name-text">{module.name}</span>
                </div>
            </div>
            <div className="folder-actions" onClick={e => e.stopPropagation()}>
                <DropdownMenu
                    align="left"
                    width={180}
                    items={[
                        {
                            label: "Edit",
                            onClick: () => navigate("/library/create-module", { state: { mode: "edit", module } }),
                            icon: <EditIcon width={16} height={16} />
                        },
                        {
                            label: deleteLabel,
                            onClick: () => onDelete?.(module.id),
                            icon: <DeleteIcon width={16} height={16} />
                        },
                        {
                            label: "Permissions",
                            onClick: (evt, trigger) => onPermissions?.(module, evt, trigger),
                            icon: <ShareIcon width={16} height={16} />
                        }
                    ]}
                >
                    <button className="btn-icon" aria-label="Module menu">
                        <DotsIcon width={16} height={16} />
                    </button>
                </DropdownMenu>
            </div>
        </div>
    );
}