import { useState } from "react";
import "./button.css";

export default function Button({
    children,
    variant = "",       // hover | toggle | static | link
    color = "#6366f1",
    initialActive = false,   // для toggle — початковий стан
    onClick,
    hoverFilled = false,     // для hover: false: біла => заливка, true: залита => біла
    width,
    height
}) {
    const [isActive, setIsActive] = useState(initialActive);

    const handleClick = (e) => {
        if (variant === "toggle") setIsActive(!isActive);
        if (onClick) onClick(e);
    };

    // Базові стилі для всіх кнопок
    let styles = {
        border: `2px solid ${color}`,
        width: width || undefined,
        height: height || undefined,
    };

    // Стилі для toggle, static, link
    const variantStyles = {
        toggle: {
            backgroundColor: isActive ? color : "white",
            color: isActive ? "white" : color,
        },
        static: {
            backgroundColor: color,
            color: "white",
        },
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

    // hover напрямок
    const hoverClass =
        variant === "hover" ? hoverFilled ? "btn-hover-inverse" : "btn-hover" : "";

    return (
        <button
            className={`btn ${hoverClass} btn-${variant}`}
            style={styles}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}