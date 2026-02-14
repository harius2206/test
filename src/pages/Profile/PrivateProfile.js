import "./profile.css";
import { useState, useEffect } from "react";
import EditableField from "../../components/editableField/editableField";
import { getUserData, saveUserData } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../api/authApi";
import { useError } from "../../context/ErrorContext";
import { useI18n } from "../../i18n";

export default function PrivateProfile() {
    const { user: ppCtxUser, setUser: ppSetUser } = useAuth();
    const { showMessage, showApiErrors } = useError();
    const { t } = useI18n();

    const [ppProfile, ppSetProfile] = useState(() => getUserData() || ppCtxUser || {
        username: "",
        first_name: "",
        last_name: "",
        description: "",
    });

    useEffect(() => {
        if (ppCtxUser) ppSetProfile((prev) => ({ ...prev, ...ppCtxUser }));
    }, [ppCtxUser]);

    useEffect(() => {
        const ppOnStorage = () => {
            const ppStored = getUserData();
            ppSetProfile(ppStored || ppCtxUser || {
                username: "",
                first_name: "",
                last_name: "",
                description: "",
            });
        };
        window.addEventListener("storage", ppOnStorage);
        return () => window.removeEventListener("storage", ppOnStorage);
    }, [ppCtxUser]);

    const ppHandleSaveField = async (key, value) => {
        const ppPayloadKey = key === "description" ? "bio" : key;
        const ppPayload = { [ppPayloadKey]: value };

        const ppUpdatedLocal = { ...ppProfile, [key]: value };
        ppSetProfile(ppUpdatedLocal);

        try {
            const ppRes = await updateUser(ppPayload);
            const ppUpdatedUserFromServer = ppRes.data || ppUpdatedLocal;

            const ppNormalized = {
                ...getUserData(),
                ...ppUpdatedUserFromServer,
            };

            if (ppNormalized.bio !== undefined) {
                ppNormalized.description = ppNormalized.bio;
                delete ppNormalized.bio;
            }

            saveUserData(ppNormalized);
            ppSetUser?.(ppNormalized);
            ppSetProfile((prev) => ({ ...prev, ...ppNormalized }));
            window.dispatchEvent(new Event("storage"));

            showMessage(t("ppProfileUpdatedMsg"), "success");
        } catch (err) {
            // revert local optimistic update
            const ppStored = getUserData();
            ppSetProfile(ppStored || ppCtxUser || {
                username: "",
                first_name: "",
                last_name: "",
                description: "",
            });

            console.error("Failed to update user:", err);
            showApiErrors(err);
        }
    };

    const ppHandleTrySave = (key, value) => {
        if (key === "username" && value.length > 20) {
            showMessage(t("ppUsernameLengthError"), "error");
            return;
        }

        ppHandleSaveField(key, value);
    };

    return (
        <div className="profile-content">
            <h1 className="profile-title">{t("ppPrivateProfileTitle")}</h1>
            <h2 className="profile-tile-description">{t("ppPrivateProfileSubtitle")}</h2>

            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                <label>
                    {t("ppUsernameLabel")}
                    <EditableField
                        value={ppProfile.username}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => ppHandleTrySave("username", val)}
                    />
                </label>

                <label>
                    {t("ppFirstNameLabel")}
                    <EditableField
                        value={ppProfile.first_name}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => ppHandleTrySave("first_name", val)}
                    />
                </label>

                <label>
                    {t("ppLastNameLabel")}
                    <EditableField
                        value={ppProfile.last_name}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => ppHandleTrySave("last_name", val)}
                    />
                </label>

                <label>
                    {t("ppDescriptionLabel")}
                    <EditableField
                        type="textarea"
                        value={ppProfile.description}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => ppHandleTrySave("description", val)}
                    />
                </label>
            </form>
        </div>
    );
}