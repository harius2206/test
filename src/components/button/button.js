import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import "./button.css";

export default function Button({
                                   children,
                                   variant = "",
                                   color = "#6366f1",
                                   active,
                                   onClick,
                                   width,
                                   height,
                                   disabled = false
                               }) {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const currentActive = !!active;
    let styles = {
        border: `2px solid ${color}`,
        width: width || "auto", // Змінено на auto за замовчуванням
        height: height || undefined,
        minWidth: "fit-content", // Гарантує, що кнопка не буде меншою за текст
        padding: "0 20px", // Універсальні падінги для будь-якої довжини тексту
        whiteSpace: "nowrap", // Текст не переноситься, а розсуває кнопку
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
    };

    if (isDark && (!variant || variant === "")) {
        Object.assign(styles, {
            backgroundColor: "var(--clr-card-bg)",
            color: "var(--clr-text)",
            border: "1px solid var(--clr-border-light)",
        });
    }

    if (isDark) {
        const purple = "#655ADE";
        const darkVariants = {
            toggle: currentActive
                ? { backgroundColor: purple, color: "#fff", border: `2px solid ${purple}` }
                : { backgroundColor: "transparent", color: purple, border: `2px solid ${purple}` },
            static: disabled
                ? { backgroundColor: "transparent", color: purple, opacity: 0.6, border: `2px solid ${purple}` }
                : { backgroundColor: purple, color: "#fff", border: `2px solid ${purple}` },
            link: {
                background: "transparent",
                color: purple,
                border: "none",
                textDecoration: "none",
                padding: "0 8px", // Для посилань падінги зазвичай менші
            },
            hover: {
                backgroundColor: "var(--clr-card-bg)",
                color: purple,
                border: `2px solid ${purple}`,
            }
        };
        if (variant && darkVariants[variant]) {
            Object.assign(styles, darkVariants[variant]);
        }
    } else {
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
                padding: "0 8px",
            },
            hover: {
                backgroundColor: "white",
                color: color,
                border: `2px solid ${color}`,
            }
        };
        if (variant && variantStyles[variant]) {
            Object.assign(styles, variantStyles[variant]);
        }
    }

    return (
        <button
            type="button"
            className={`btn btn-${variant} ${currentActive ? 'active' : ''}`}
            style={styles}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}