import "./profile.css";
import { useState, useEffect, useRef } from "react";
import { updateUser } from "../../api/authApi";
import { getUserData, saveUserData } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
import Button from "../../components/button/button";

export default function ChangePhoto() {
    const cpFileInputRef = useRef(null);
    const { t } = useI18n();

    const { user: cpCtxUser, setUser: cpSetUser } = useAuth();
    const [cpProfile, cpSetProfile] = useState(() => getUserData() || cpCtxUser || {});

    const [cpPreview, cpSetPreview] = useState(null);
    const [cpLoading, cpSetLoading] = useState(false);
    const [cpImgBroken, cpSetImgBroken] = useState(false);

    const [cpRefreshKey, cpSetRefreshKey] = useState(0);

    useEffect(() => {
        if (cpCtxUser) {
            cpSetProfile((prev) => ({ ...prev, ...cpCtxUser }));
        }
    }, [cpCtxUser]);

    useEffect(() => {
        return () => {
            if (cpPreview && cpPreview.startsWith && cpPreview.startsWith("blob:")) {
                URL.revokeObjectURL(cpPreview);
            }
        };
    }, [cpPreview]);

    useEffect(() => {
        cpSetImgBroken(false);
    }, [cpPreview, cpProfile.avatar]);

    const cpHandleSelectPhoto = () => {
        cpFileInputRef.current?.click();
    };

    const cpHandleChangeFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (cpPreview && cpPreview.startsWith && cpPreview.startsWith("blob:")) {
            URL.revokeObjectURL(cpPreview);
        }

        const url = URL.createObjectURL(file);
        cpSetPreview(url);
    };

    const cpWithTs = (url) => {
        if (!url) return url;
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}ts=${Date.now()}`;
    };

    const cpHandleUpload = async () => {
        const file = cpFileInputRef.current?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        cpSetLoading(true);

        try {
            const res = await updateUser(formData);
            const updatedUser = res?.data || {};

            const serverAvatar = updatedUser.avatar ?? updatedUser.avatar_url ?? null;

            const normalized = {
                ...getUserData(),
                ...updatedUser,
            };

            if (serverAvatar !== null) {
                normalized.avatar = cpWithTs(serverAvatar);
            } else {
                normalized.avatar = null;
            }

            saveUserData(normalized);
            cpSetUser?.(normalized);
            cpSetProfile(normalized);

            if (cpPreview && cpPreview.startsWith && cpPreview.startsWith("blob:")) {
                URL.revokeObjectURL(cpPreview);
            }
            cpSetPreview(null);
            if (cpFileInputRef.current) cpFileInputRef.current.value = null;

            cpSetRefreshKey((k) => k + 1);

            window.dispatchEvent(new Event("storage"));
        } catch (err) {
            console.error("Avatar upload failed:", err);
        } finally {
            cpSetLoading(false);
        }
    };

    const cpHandleDelete = () => {
        const normalized = { ...getUserData(), ...cpProfile, avatar: null };
        saveUserData(normalized);
        cpSetUser?.(normalized);
        cpSetProfile(normalized);

        if (cpPreview && cpPreview.startsWith && cpPreview.startsWith("blob:")) {
            URL.revokeObjectURL(cpPreview);
        }
        cpSetPreview(null);
        if (cpFileInputRef.current) cpFileInputRef.current.value = null;

        cpSetRefreshKey((k) => k + 1);

        window.dispatchEvent(new Event("storage"));
    };

    const cpHasImageSource = !!(cpPreview || cpProfile.avatar);
    const cpShouldShowImage = cpHasImageSource && !cpImgBroken;
    const cpImgSrc = cpPreview ? cpPreview : cpProfile.avatar ? cpProfile.avatar : null;

    const cpAvatarUrl = cpImgSrc || null;

    const cpAvatarBoxStyle = {
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

    const cpAvatarImgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    };

    return (
        <div className="profile-content">
            <h1 className="profile-title">{t("cpChangePhotoTitle")}</h1>
            <h2 className="profile-tile-description">{t("cpChangePhotoSubtitle")}</h2>

            <div className="change-photo-wrapper">
                <div style={cpAvatarBoxStyle} className="avatar-box">
                    {cpShouldShowImage ? (
                        <img
                            key={cpRefreshKey}
                            src={cpAvatarUrl}
                            alt="avatar"
                            style={cpAvatarImgStyle}
                            onError={(e) => {
                                cpSetImgBroken(true);
                                const img = e.currentTarget;
                                img.onerror = null;
                                img.src = "/placeholder-avatar.png";
                                img.style.display = "block";
                            }}
                        />
                    ) : (
                        <>{t("cpNoAvatarText")}</>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={cpFileInputRef}
                    onChange={cpHandleChangeFile}
                    style={{ display: "none" }}
                />

                <div className="photo-buttons">
                    <Button
                        variant="hover"
                        width={130}
                        height={40}
                        onClick={cpHandleSelectPhoto}
                        disabled={cpLoading}
                    >
                        {t("cpChoosePhotoBtn")}
                    </Button>

                    {cpPreview && (
                        <Button
                            variant="static"
                            width={130}
                            height={40}
                            onClick={cpHandleUpload}
                            disabled={cpLoading}
                        >
                            {cpLoading ? t("cpUploadingPhotoBtn") : t("cpSavePhotoBtn")}
                        </Button>
                    )}

                    {!cpPreview && cpProfile.avatar && (
                        <Button
                            variant="toggle"
                            width={130}
                            height={40}
                            onClick={cpHandleDelete}
                            disabled={cpLoading}
                        >
                            {t("cpDeletePhotoBtn")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}