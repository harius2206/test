import React, { useMemo } from "react";
import "./avatar.css";

export default function UserAvatar({ name, avatar, size = 32, fontSize = 16 }) {
    const bgColor = useMemo(() => {
        const colors = [
            "#ef4444", "#f97316", "#facc15",
            "#22c55e", "#06b6d4", "#3b82f6",
            "#6366f1", "#8b5cf6", "#d946ef",
            "#ec4899", "#78716c"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }, [name]);

    return (
        <div
            className="user-avatar"
            style={{ width: size, height: size, backgroundColor: avatar ? "transparent" : bgColor }}
        >
            {avatar ? (
                <img src={avatar} alt={name} className="user-avatar-img" />
            ) : (
                <span
                    className="user-avatar-text"
                    style={{ fontSize: fontSize }}
                >
                    {name?.[0]?.toUpperCase() || "?"}
                </span>
            )}
        </div>
    );
}