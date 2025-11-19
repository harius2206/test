// javascript
// File: `src/pages/Profile/PrivateProfile.js`
import "./profile.css";
import { useState, useEffect } from "react";
import EditableField from "../../components/editableField/editableField";
import { getUserData, saveUserData } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../api/authApi";
import { useError } from "../../context/ErrorContext";

export default function PrivateProfile() {
    const { user: ctxUser, setUser } = useAuth();
    const { showMessage, showApiErrors } = useError();

    const [profile, setProfile] = useState(() => getUserData() || ctxUser || {
        username: "",
        first_name: "",
        last_name: "",
        description: "",
    });

    useEffect(() => {
        if (ctxUser) setProfile((prev) => ({ ...prev, ...ctxUser }));
    }, [ctxUser]);

    useEffect(() => {
        const onStorage = () => {
            const stored = getUserData();
            setProfile(stored || ctxUser || {
                username: "",
                first_name: "",
                last_name: "",
                description: "",
            });
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [ctxUser]);

    const handleSaveField = async (key, value) => {
        const payloadKey = key === "description" ? "bio" : key;
        const payload = { [payloadKey]: value };

        const updatedLocal = { ...profile, [key]: value };
        setProfile(updatedLocal);

        try {
            const res = await updateUser(payload);
            const updatedUserFromServer = res.data || updatedLocal;

            const normalized = {
                ...getUserData(),
                ...updatedUserFromServer,
            };

            if (normalized.bio !== undefined) {
                normalized.description = normalized.bio;
                delete normalized.bio;
            }

            saveUserData(normalized);
            setUser?.(normalized);
            setProfile((prev) => ({ ...prev, ...normalized }));
            window.dispatchEvent(new Event("storage"));

            showMessage("Profile updated successfully.", "success");
        } catch (err) {
            // revert local optimistic update
            const stored = getUserData();
            setProfile(stored || ctxUser || {
                username: "",
                first_name: "",
                last_name: "",
                description: "",
            });

            console.error("Failed to update user:", err);

            // Use global error helper to show API errors
            showApiErrors(err);
        }
    };

    const handleTrySave = (key, value) => {
        if (key === "username" && value.length > 20) {
            showMessage("Username must be 20 characters or less.", "error");
            return;
        }

        handleSaveField(key, value);
    };

    return (
        <div className="profile-content">
            <h1 className="profile-title">Private profile</h1>
            <h2 className="profile-tile-description">Add some information about you</h2>

            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                <label>
                    username
                    <EditableField
                        value={profile.username}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleTrySave("username", val)}
                    />
                </label>

                <label>
                    first name
                    <EditableField
                        value={profile.first_name}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleTrySave("first_name", val)}
                    />
                </label>

                <label>
                    last name
                    <EditableField
                        value={profile.last_name}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleTrySave("last_name", val)}
                    />
                </label>

                <label>
                    description
                    <EditableField
                        type="textarea"
                        value={profile.description}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleTrySave("description", val)}
                    />
                </label>
            </form>
        </div>
    );
}