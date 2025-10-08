import { useState } from "react";
import "./button.css";

export default function Button({
                                   children,
                                   variant = "",
                                   color = "#6366f1",
                                   active, // тепер тільки controlled
                                   onClick,
                                   width,
                                   height,
                                   disabled = false
                               }) {
    const handleClick = (e) => {
        if (disabled) return;
        if (onClick) onClick(e);
    };

    const currentActive = !!active;

    let styles = {
        border: `2px solid ${color}`,
        width: width || undefined,
        height: height || undefined,
        cursor: disabled ? "not-allowed" : "pointer",
    };

    const variantStyles = {
        toggle: {
            backgroundColor: currentActive ? color : "white",
            color: currentActive ? "white" : color,
        },
        static: disabled
            ? { backgroundColor: "white", color: color, border: `2px solid ${color}` }
            : { backgroundColor: color, color: "white" },
        link: {
            background: "transparent",
            color: color,
            border: "none",
            textDecoration: "none",
        },
    };

    if (variant !== "hover") {
        Object.assign(styles, variantStyles[variant]);
    }

    return (
        <button
            type="button"
            className={`btn btn-${variant}`}
            style={styles}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}