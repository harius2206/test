import React from "react";
import { createPortal } from "react-dom";
import "./tooltip.css";

export default function Tooltip({ children, targetRef, visible }) {
    if (!targetRef.current) return null;

    const rect = targetRef.current.getBoundingClientRect();

    return createPortal(
        <div
            className={`tooltip ${visible ? "visible" : ""}`}
            style={{
                top: rect.top + window.scrollY + rect.height / 2,
                left: rect.right + 8,
                transform: "translateY(-50%)",
            }}
        >
            {children}
        </div>,
        document.body
    );
}
