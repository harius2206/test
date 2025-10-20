import React, { useState } from "react";
import "./sidePanel.css";
import { ReactComponent as ArrowLeft } from "../../images/arrowLeft.svg";
import { ReactComponent as ArrowRight } from "../../images/arrowRight.svg";
import { ReactComponent as FolderIcon } from "../../images/folder.svg";
import { ReactComponent as CardIcon } from "../../images/cards.svg";

export default function SidePanel({ anchor = "left" }) {
    const [open, setOpen] = useState(false);
    const anchorClass = anchor === "right" ? "attach-right" : "attach-left";

    const folders = [
        { name: "Frontend", color: "#6366f1" },
        { name: "Backend", color: "#10b981" },
        { name: "Design", color: "#f59e0b" },
    ];

    const modules = [
        { name: "React Basics" },
        { name: "Node API" },
        { name: "UI Components" },
    ];

    return (
        <div className={`side-panel-wrapper ${anchorClass} ${open ? "open" : ""}`}>
            <div className="side-panel">
                {open && (
                    <div className="side-icons">
                        {folders.map((folder, i) => (
                            <div key={`folder-${i}`} className="side-icon-wrapper">
                                <button
                                    className="side-icon folder-icon"
                                    style={{ color: folder.color }}
                                >
                                    <FolderIcon />
                                </button>
                                <span className="side-tooltip">{folder.name}</span>
                            </div>
                        ))}

                        <div className="side-separator" />

                        {modules.map((mod, i) => (
                            <div key={`module-${i}`} className="side-icon-wrapper">
                                <button className="side-icon">
                                    <CardIcon />
                                </button>
                                <span className="side-tooltip">{mod.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                className="side-toggle-btn"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                {open ? <ArrowLeft /> : <ArrowRight />}
            </button>
        </div>
    );
}
