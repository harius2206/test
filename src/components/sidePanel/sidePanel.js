import React, { useState, useRef } from "react";
import "./sidePanel.css";
import { ReactComponent as ArrowLeft } from "../../images/arrowLeft.svg";
import { ReactComponent as ArrowRight } from "../../images/arrowRight.svg";
import { ReactComponent as FolderIcon } from "../../images/folder.svg";
import { ReactComponent as CardIcon } from "../../images/cards.svg";
import Tooltip from "../tooltip/tooltip";

export default function SidePanel({ isLeftAligned = false }) {
    const [open, setOpen] = useState(false);
    const [hoveredTooltip, setHoveredTooltip] = useState(null);
    const iconRefs = useRef({});

    const folders = Array.from({ length: 10 }, (_, i) => ({ id: `folder-${i}`, tooltip: `Folder ${i + 1}` }));
    const modules = Array.from({ length: 5 }, (_, i) => ({ id: `module-${i}`, tooltip: `Module ${i + 1}` }));

    return (
        <div className={`side-panel-wrapper ${isLeftAligned ? "left-aligned" : ""} ${open ? "open" : ""}`}>
            <div className="side-panel">
                {open && (
                    <div className="side-icons">
                        {folders.map(folder => (
                            <div key={folder.id} className="side-icon-wrapper">
                                <button
                                    className="side-icon"
                                    ref={el => (iconRefs.current[folder.id] = el)}
                                    onMouseEnter={() => setHoveredTooltip(folder.id)}
                                    onMouseLeave={() => setHoveredTooltip(null)}
                                >
                                    <FolderIcon />
                                </button>
                                {hoveredTooltip === folder.id && (
                                    <Tooltip targetRef={{ current: iconRefs.current[folder.id] }} visible>
                                        {folder.tooltip}
                                    </Tooltip>
                                )}
                            </div>
                        ))}

                        {modules.map(module => (
                            <div key={module.id} className="side-icon-wrapper">
                                <button
                                    className="side-icon"
                                    ref={el => (iconRefs.current[module.id] = el)}
                                    onMouseEnter={() => setHoveredTooltip(module.id)}
                                    onMouseLeave={() => setHoveredTooltip(null)}
                                >
                                    <CardIcon />
                                </button>
                                {hoveredTooltip === module.id && (
                                    <Tooltip targetRef={{ current: iconRefs.current[module.id] }} visible>
                                        {module.tooltip}
                                    </Tooltip>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button className="side-toggle-btn" onClick={() => setOpen(!open)}>
                {open ? <ArrowLeft /> : <ArrowRight />}
            </button>
        </div>
    );
}
