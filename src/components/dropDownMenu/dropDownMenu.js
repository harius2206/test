import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./dropDownMenu.css";

export default function DropdownMenu({
                                         items = [],
                                         children,
                                         align = "left",
                                         width = 180,
                                         open: controlledOpen,
                                         setOpen: controlledSetOpen
                                     }) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const isControlled = controlledOpen !== undefined && controlledSetOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? controlledSetOpen : setUncontrolledOpen;

    const getMenuStyle = useCallback(() => {
        if (!btnRef.current) return {};
        const rect = btnRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        let left;
        if (align === "right") {
            left = rect.left + scrollX + rect.width - width;
        } else {
            left = rect.left + scrollX;
        }
        const top = rect.top + scrollY + rect.height + 4;
        return {
            position: "absolute",
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
            width: `${width}px`,
            zIndex: 99999
        };
    }, [align, width]);

    useEffect(() => {
        if (!open) return;
        const onDocDown = (e) => {
            const target = e.target;
            if (btnRef.current && btnRef.current.contains(target)) return;
            if (menuRef.current && menuRef.current.contains(target)) return;
            setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocDown);
        document.addEventListener("touchstart", onDocDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocDown);
            document.removeEventListener("touchstart", onDocDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, setOpen]);

    return (
        <div className="dm-wrapper" ref={btnRef}>
            <div
                className="dm-trigger"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
            >
                {children}
            </div>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="dm-menu"
                        style={getMenuStyle()}
                        role="menu"
                    >
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="dm-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick?.(e, btnRef.current);
                                    setOpen(false);
                                }}
                            >
                                {item.icon && <span className="dm-icon">{item.icon}</span>}
                                <span className="dm-label">{item.label}</span>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
}