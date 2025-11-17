import "./profile.css";
import { useState, useEffect } from "react";
import EditableField from "../../components/editableField/editableField";
import { getUserData, saveUserData } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";

export default function PrivateProfile() {
    const { user: ctxUser, setUser } = useAuth();
    const [profile, setProfile] = useState(() => getUserData() || ctxUser || {
        username: "",
        first_name: "",
        last_name: "",
        description: "",
    });

    useEffect(() => {
        if (ctxUser) setProfile((prev) => ({ ...prev, ...ctxUser }));
    }, [ctxUser]);

    // Sync with localStorage changes
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

    const handleSaveField = (key, value) => {
        const updated = { ...profile, [key]: value };
        setProfile(updated);
        saveUserData(updated);
        setUser?.(updated);
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <div className="profile-content">
            <h1 className="profile-title">Private profile</h1>
            <h2 className="profile-tile-description">Add some information about you</h2>

            <form className="profile-form">
                <label>
                    username
                    <EditableField
                        value={profile.username}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleSaveField("username", val)}
                    />
                </label>

                <label>
                    first name
                    <EditableField
                        value={profile.first_name}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleSaveField("first_name", val)}
                    />
                </label>

                <label>
                    last name
                    <EditableField
                        value={profile.last_name}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleSaveField("last_name", val)}
                    />
                </label>

                <label>
                    description
                    <EditableField
                        type="textarea"
                        value={profile.description}
                        autosave
                        showEditIconWhenAutosave
                        onSave={(val) => handleSaveField("description", val)}
                    />
                </label>
            </form>
        </div>
    );
}
