import React, { useState, useEffect } from "react";
import { getUserAvatar, getUserData } from "../../utils/storage";

export default function UserAvatar({
                                       src,
                                       avatar,
                                       name = "",
                                       size = 40,
                                       fontSize,
                                       className = "",
                                       style = {},
                                       alt,
                                       disableStrictFallback = false, // Новий проп
                                   }) {
    const currentUserData = disableStrictFallback ? null : (getUserAvatar() || getUserData()?.avatar);
    const imageSrc = src || avatar || currentUserData || undefined;

    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [imageSrc]);

    const initials = name
        ? name
            .trim()
            .split(/\s+/)
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "";

    const computedFontSize = fontSize || Math.max(12, Math.floor(size * 0.4));

    const containerStyle = {
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#666",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: `${computedFontSize}px`,
        userSelect: "none",
        overflow: "hidden",
        ...style,
    };

    const imgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    };

    return (
        <div className={`user-avatar ${className}`} style={containerStyle} aria-label={alt || name}>
            {imageSrc && !imgError ? (
                <img
                    key={imageSrc}
                    src={imageSrc}
                    alt={alt || name || "avatar"}
                    style={imgStyle}
                    onError={() => setImgError(true)}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}