import { useState } from "react";
import "./button.css";

export default function Button({
                                   children,
                                   variant = "",       // hover | toggle | static | link
                                   color = "#6366f1",
                                   initialActive = false,   // для toggle — початковий стан
                                   onClick,
                                   hoverFilled = false,     // для hover
                                   width,
                                   height,
                                   disabled = false
                               }) {
    const [isActive, setIsActive] = useState(initialActive);

    const handleClick = (e) => {
        if (disabled) return;

        if (variant === "toggle") {
            setIsActive(true); // активуємо тимчасово
            setTimeout(() => setIsActive(false), 300); // повертаємося назад через 200ms
        }

        if (onClick) onClick(e);
    };

    let styles = {
        border: `2px solid ${color}`,
        width: width || undefined,
        height: height || undefined,
        cursor: disabled ? "not-allowed" : "pointer",
    };

    const variantStyles = {
        toggle: {
            backgroundColor: isActive ? "white" : color, // спочатку залита кнопка
            color: isActive ? color : "white",          // при кліку білий фон, текст кольору кнопки
        },
        static: disabled
            ? {
                backgroundColor: "white",
                color: color,
                border: `2px solid ${color}`,
            }
            : {
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

    const hoverClass =
        variant === "hover" ? (hoverFilled ? "btn-hover-inverse" : "btn-hover") : "";

    return (
        <button
            className={`btn ${hoverClass} btn-${variant}`}
            style={styles}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
