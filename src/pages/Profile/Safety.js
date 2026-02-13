import { useState, useEffect } from "react";
import Button from "../../components/button/button";
import EditableField from "../../components/editableField/editableField";
import { getUserData } from "../../utils/storage";
import "./profile.css";
import { changePassword } from "../../api/authApi";
import { useError } from "../../context/ErrorContext";
import { requestEmailChange } from "../../api/authApi";
import { Link } from "react-router-dom";
import {
    getDeeplKeys,
    createDeeplKey,
    updateDeeplKey,
    deleteDeeplKey
} from "../../api/deeplApi";

export default function Safety() {
    const storedInitial = getUserData();
    const { showMessage, showError } = useError();

    // Email & Password states
    const [email, setEmail] = useState(storedInitial?.email || "");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cooldown, setCooldown] = useState(0);

    // DeepL states
    const [deeplKey, setDeeplKey] = useState("");
    const [existingKeyObj, setExistingKeyObj] = useState(null); // Об'єкт ключа з бекенду (id, status, characters...)
    const [loadingKey, setLoadingKey] = useState(false);

    // Timer for email cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // Sync email with localStorage changes
    useEffect(() => {
        const onStorage = () => {
            const stored = getUserData();
            setEmail(stored?.email || "");
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Load DeepL Key on mount
    useEffect(() => {
        loadDeepLKey();
    }, []);

    const loadDeepLKey = async () => {
        try {
            const res = await getDeeplKeys();
            if (res.data && res.data.length > 0) {
                // Беремо перший ключ (якщо логіка передбачає один ключ на юзера)
                const keyData = res.data[0];
                setExistingKeyObj(keyData);
                // Маскуємо ключ для відображення, або показуємо порожнім, якщо з метою безпеки бекенд його не віддає повністю
                // Тут припускаємо, що ми хочемо редагувати новий, тому поле input спочатку порожнє або заповнене якщо треба
                setDeeplKey("");
            } else {
                setExistingKeyObj(null);
            }
        } catch (err) {
            console.error("Failed to load DeepL key", err);
        }
    };

    const handleSendEmail = async () => {
        if (!email) {
            showError("Email cannot be empty.");
            return;
        }

        try {
            await requestEmailChange(email);
            showMessage("Verification email sent! Check your inbox.", "success");
            setCooldown(30);
        } catch (err) {
            showError(err?.response?.data || "Failed to send verification email.");
        }
    };

    const handleSaveApiKey = async () => {
        if (!deeplKey.trim()) {
            showError("API key cannot be empty.");
            return;
        }

        setLoadingKey(true);
        try {
            if (existingKeyObj) {
                await updateDeeplKey(existingKeyObj.id, deeplKey);
                showMessage("DeepL key updated successfully.", "success");
            } else {
                await createDeeplKey(deeplKey);
                showMessage("DeepL key created successfully.", "success");
            }
            setDeeplKey("");
            await loadDeepLKey();
        } catch (err) {
            showError(err?.response?.data?.detail || "Failed to save DeepL key.");
        } finally {
            setLoadingKey(false);
        }
    };


    const handleDeleteApiKey = async () => {
        if (!existingKeyObj) return;

        setLoadingKey(true);
        try {
            await deleteDeeplKey(existingKeyObj.id);
            setExistingKeyObj(null);
            setDeeplKey("");
            showMessage("DeepL key deleted.", "success");
        } catch (err) {
            showError(err, "Failed to delete DeepL key.");
        } finally {
            setLoadingKey(false);
        }
    };

    // Формуємо статус для відображення
    let apiKeyStatusText = "No key";
    if (existingKeyObj) {
        if (existingKeyObj.status) {
            // Якщо бекенд повертає статус і ліміти
            apiKeyStatusText = `${existingKeyObj.status}`;
            if (existingKeyObj.remaining_characters !== undefined) {
                apiKeyStatusText += ` (${existingKeyObj.remaining_characters} chars left)`;
            }
        } else {
            apiKeyStatusText = "Active key";
        }
    }

    return (
        <div className="profile-content">
            <h1 className="profile-title">Safety</h1>
            <h2 className="profile-tile-description">Here you can change your email or password</h2>

            <div className="profile-form">
                <label>
                    Your email
                    <EditableField
                        type="text"
                        value={email}
                        autosave
                        onSave={setEmail}
                    />
                </label>

                <p className="advice-message">
                    Enter a new email; a confirmation message will be sent to it. After confirmation, the email will be updated.
                </p>

                <div className="button-wrapper">
                    <Button
                        variant="static"
                        color="var(--accent)"
                        onClick={handleSendEmail}
                        disabled={cooldown > 0}
                        width="170px"
                        height="46px"
                    >
                        {cooldown > 0 ? "Wait..." : "Send"}
                    </Button>
                    {cooldown > 0 && <span className="cooldown-text">{cooldown}s</span>}
                </div>

                <hr />

                <label>
                    Your password
                    <EditableField type="password" value={password} onSave={setPassword} />
                </label>

                <label>
                    New password
                    <EditableField type="password" value={newPassword} onSave={setNewPassword} />
                </label>

                <label>
                    Confirm new password
                    <EditableField type="password" value={confirmPassword} onSave={setConfirmPassword} />
                </label>

                <div className="button-wrapper">
                    <Button
                        variant="toggle"
                        color="var(--accent)"
                        width="170px"
                        height="46px"
                        onClick={async () => {
                            document.activeElement.blur();

                            if (!password || !newPassword || !confirmPassword) {
                                showError("All fields must be filled.");
                                return;
                            }

                            if (newPassword !== confirmPassword) {
                                showError("Passwords do not match.");
                                return;
                            }

                            try {
                                await changePassword({
                                    old_password: password,
                                    new_password1: newPassword,
                                    new_password2: confirmPassword,
                                });

                                showMessage("Password changed successfully!", "success");

                                setPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                            } catch (err) {
                                showError(err, "Failed to change password.");
                            }
                        }}
                    >
                        Change password
                    </Button>

                    <Link to="/reset-password">
                        <Button variant="toggle" color="var(--accent)" width="170px" height="46px">
                            Forgot password
                        </Button>
                    </Link>
                </div>

                <hr />

                <label>
                    Your DeepL API key status
                    <EditableField type="text" value={apiKeyStatusText} editable={false} />
                </label>

                <label>
                    {existingKeyObj ? "Update DeepL API key" : "Add DeepL API key"}
                    <EditableField
                        type="text"
                        value={deeplKey}
                        autosave
                        onSave={setDeeplKey}
                        placeholder={existingKeyObj ? "Enter new key to update" : "Enter key"}
                    />
                </label>


                <div className="button-wrapper">
                    <Button
                        variant="toggle"
                        color="var(--accent)"
                        width="170px"
                        height="46px"
                        disabled={loadingKey}
                        onClick={() => {
                            document.activeElement.blur();
                            setTimeout(handleSaveApiKey, 0);
                        }}

                    >
                        {loadingKey ? "Saving..." : (existingKeyObj ? "Update key" : "Save key")}
                    </Button>

                    {existingKeyObj && (
                        <Button
                            variant="toggle"
                            color="var(--danger)"
                            width="170px"
                            height="46px"
                            disabled={loadingKey}
                            onClick={handleDeleteApiKey}
                        >
                            {loadingKey ? "Deleting..." : "Delete DeepL key"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}