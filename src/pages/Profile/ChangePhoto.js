import "./profile.css";
import { useState, useEffect, useRef } from "react";
import { updateUser } from "../../api/authApi";
import { getUserData, saveUserData } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/button/button";
import UserAvatar from "../../components/avatar/avatar";

export default function ChangePhoto() {
    const fileInputRef = useRef(null);

    const { user: ctxUser, setUser } = useAuth();
    const [profile, setProfile] = useState(() => getUserData() || ctxUser || {});

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imgBroken, setImgBroken] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (ctxUser) {
            setProfile((prev) => ({ ...prev, ...ctxUser }));
        }
    }, [ctxUser]);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    useEffect(() => {
        setImgBroken(false);
    }, [preview, profile.avatar]);

    const handleSelectPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleChangeFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (preview && preview.startsWith && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }

        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    const withTs = (url) => {
        if (!url) return url;
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}ts=${Date.now()}`;
    };

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        setLoading(true);

        try {
            const res = await updateUser(formData);
            const updatedUser = res?.data || {};

            const serverAvatar = updatedUser.avatar ?? updatedUser.avatar_url ?? null;

            const normalized = {
                ...getUserData(),
                ...updatedUser,
            };

            if (serverAvatar !== null) {
                normalized.avatar = withTs(serverAvatar);
            } else {
                normalized.avatar = null;
            }

            saveUserData(normalized);
            setUser?.(normalized);
            setProfile(normalized);

            if (preview && preview.startsWith && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = null;

            setRefreshKey((k) => k + 1);

            window.dispatchEvent(new Event("storage"));
        } catch (err) {
            console.error("Avatar upload failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        const normalized = { ...getUserData(), ...profile, avatar: null };
        saveUserData(normalized);
        setUser?.(normalized);
        setProfile(normalized);

        if (preview && preview.startsWith && preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;

        setRefreshKey((k) => k + 1);

        window.dispatchEvent(new Event("storage"));
    };

    const hasImageSource = !!(preview || profile.avatar);
    const shouldShowImage = hasImageSource && !imgBroken;
    const imgSrc = preview ? preview : profile.avatar ? profile.avatar : null;

    const avatarUrl =
        imgSrc || null;

    const avatarBoxStyle = {
        width: 250,
        height: 250,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f3f3",
        border: "1px solid var(--border-light, #ddd)",
        marginBottom: 16,
    };

    const avatarImgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    };

    return (
        <div className="profile-content">
            <h1 className="profile-title">Change photo</h1>
            <h2 className="profile-tile-description">Upload a new avatar</h2>

            <div className="change-photo-wrapper">
                <div style={avatarBoxStyle} className="avatar-box">
                    {shouldShowImage ? (
                        <img
                            key={refreshKey}
                            src={avatarUrl}
                            alt="avatar"
                            style={avatarImgStyle}
                            onError={(e) => {
                                setImgBroken(true);
                                const img = e.currentTarget;
                                img.onerror = null;
                                img.src = "/placeholder-avatar.png";
                                img.style.display = "block";
                            }}
                        />
                    ) : (
                        <>none</>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleChangeFile}
                    style={{ display: "none" }}
                />

                <div className="photo-buttons">
                    <Button
                        variant="hover"
                        width={130}
                        height={40}
                        onClick={handleSelectPhoto}
                        disabled={loading}
                    >
                        Choose photo
                    </Button>

                    {preview && (
                        <Button
                            variant="static"
                            width={130}
                            height={40}
                            onClick={handleUpload}
                            disabled={loading}
                        >
                            {loading ? "Uploading..." : "Save"}
                        </Button>
                    )}

                    {!preview && profile.avatar && (
                        <Button
                            variant="toggle"
                            width={130}
                            height={40}
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}