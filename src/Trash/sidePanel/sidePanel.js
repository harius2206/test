import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./sidePanel.css";
import { ReactComponent as ArrowRight } from "../../images/arrowRight.svg";
import { ReactComponent as FolderIcon } from "../../images/folder.svg";
import { ReactComponent as BookIcon } from "../../images/book.svg";
import { useNavigate } from "react-router-dom";

export default function SidePanel({
                                      items = [],
                                      side = "left",
                                      anchorRef = null
                                  }) {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(null); // для тултіпів
    const panelRef = useRef(null);
    const navigate = useNavigate();

    // закріплення всередині контенту
    useLayoutEffect(() => {
        const content = document.querySelector(".content");
        if (content && getComputedStyle(content).position === "static") {
            content.style.position = "relative";
        }
    }, []);

    useEffect(() => {
        if (!panelRef.current) return;
        const panel = panelRef.current;
        panel.style.position = "absolute";
        panel.style.top = "0";
        panel.style.bottom = "0";
        panel.style.height = "100%";
        panel.style[side] = "0";
    }, [side]);

    const handleToggle = () => setOpen((s) => !s);

    // тултіп (рендериться через портал поверх усього)
    const Tooltip = ({ text, target }) => {
        if (!target) return null;
        const rect = target.getBoundingClientRect();
        const style = {
            position: "fixed",
            top: rect.top + rect.height / 2,
            left: side === "left" ? rect.right + 8 : rect.left - 8,
            transform: "translateY(-50%)",
            zIndex: 9999,
        };

        return ReactDOM.createPortal(
            <div
                className={`side-global-tooltip ${side}`}
                style={style}
            >
                {text}
            </div>,
            document.body
        );
    };

    return (
        <>
            <div
                ref={panelRef}
                className={`side-panel in-content ${side} ${open ? "open" : "closed"}`}
            >
                {/* Toggle button rendered inside the panel so it is attached and moves with panel */}
                <button
                    className={`side-toggle-btn ${open ? "open" : "closed"}`}
                    onClick={handleToggle}
                    aria-label="Toggle panel"
                    aria-expanded={open}
                >
                    <ArrowRight className="arrow" />
                </button>

                <div className="side-content">
                    <div className="side-scroll">
                        {items.map((it, idx) => (
                            <div
                                key={idx}
                                className="side-item"
                                onClick={() => navigate(it.link)}
                                onMouseEnter={(e) => setHovered({ name: it.name, el: e.currentTarget })}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {it.type === "folder" ? (
                                    <FolderIcon className="side-icon" />
                                ) : (
                                    <BookIcon className="side-icon" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* тултіп поверх усіх (портал) */}
            {hovered && <Tooltip text={hovered.name} target={hovered.el} />}
        </>
    );
}
