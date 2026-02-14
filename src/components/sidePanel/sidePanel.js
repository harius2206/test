import React, { useState, useRef, useEffect } from "react";
import "./sidePanel.css";
import { ReactComponent as ArrowLeft } from "../../images/arrowLeft.svg";
import { ReactComponent as ArrowRight } from "../../images/arrowRight.svg";
import { ReactComponent as FolderIcon } from "../../images/folder.svg";
import { ReactComponent as CardIcon } from "../../images/cards.svg";
import Tooltip from "../tooltip/tooltip";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPinnedFolders } from "../../api/foldersApi";
import { getPinnedModules } from "../../api/modulesApi";
import { useI18n } from "../../i18n";

export default function SidePanel({ isLeftAligned = false }) {
    const { t } = useI18n(); // <-- використання i18n
    const [open, setOpen] = useState(false);
    const [hoveredTooltip, setHoveredTooltip] = useState(null);
    const iconRefs = useRef({});

    const { user } = useAuth();
    const navigate = useNavigate();

    const [pinnedFolders, setPinnedFolders] = useState([]);
    const [pinnedModules, setPinnedModules] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchPinned = async () => {
            try {
                const [foldersRes, modulesRes] = await Promise.all([
                    getPinnedFolders(user.id),
                    getPinnedModules(user.id)
                ]);

                const foldersData = foldersRes.data.results || foldersRes.data || [];
                const modulesData = modulesRes.data.results || modulesRes.data || [];

                setPinnedFolders(foldersData);
                setPinnedModules(modulesData);
            } catch (err) {
                console.error("Failed to fetch pinned items", err);
            }
        };

        if (open) {
            fetchPinned();
        }
    }, [user, open]);

    return (
        <div className={`side-panel-wrapper ${isLeftAligned ? "left-aligned" : ""} ${open ? "open" : ""}`}>
            <div className="side-panel">
                {open && (
                    <div className="side-icons">
                        {pinnedFolders.map(folder => (
                            <div key={`f-${folder.id}`} className="side-icon-wrapper">
                                <button
                                    className="side-icon"
                                    ref={el => (iconRefs.current[`f-${folder.id}`] = el)}
                                    onMouseEnter={() => setHoveredTooltip(`f-${folder.id}`)}
                                    onMouseLeave={() => setHoveredTooltip(null)}
                                    onClick={() => navigate(`/library/folders/${folder.id}`)}
                                    style={{ color: folder.color || "inherit" }}
                                >
                                    <FolderIcon />
                                </button>
                                {hoveredTooltip === `f-${folder.id}` && (
                                    <Tooltip targetRef={{ current: iconRefs.current[`f-${folder.id}`] }} visible>
                                        {folder.name}
                                    </Tooltip>
                                )}
                            </div>
                        ))}

                        {pinnedFolders.length > 0 && pinnedModules.length > 0 && (
                            <div style={{ height: "1px", background: "#444", margin: "8px 12px" }} />
                        )}

                        {pinnedModules.map(module => (
                            <div key={`m-${module.id}`} className="side-icon-wrapper">
                                <button
                                    className="side-icon"
                                    ref={el => (iconRefs.current[`m-${module.id}`] = el)}
                                    onMouseEnter={() => setHoveredTooltip(`m-${module.id}`)}
                                    onMouseLeave={() => setHoveredTooltip(null)}
                                    onClick={() => navigate(`/library/module-view?id=${module.id}`)}
                                >
                                    <CardIcon />
                                </button>
                                {hoveredTooltip === `m-${module.id}` && (
                                    <Tooltip targetRef={{ current: iconRefs.current[`m-${module.id}`] }} visible>
                                        {module.name}
                                    </Tooltip>
                                )}
                            </div>
                        ))}

                        {pinnedFolders.length === 0 && pinnedModules.length === 0 && (
                            <div style={{ color: "#888", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
                                {t("spNoPins_label")}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button className="side-toggle-btn" onClick={() => setOpen(!open)}>
                {open ? <ArrowLeft /> : <ArrowRight />}
            </button>
        </div>
    );
}
