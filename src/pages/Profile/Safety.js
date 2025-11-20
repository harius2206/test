// JavaScript
import { useState, useEffect } from "react";
import Button from "../../components/button/button";
import EditableField from "../../components/editableField/editableField";
import { getUserData, saveUserData } from "../../utils/storage";
import "./profile.css";
import { changePassword } from "../../api/authApi";
import { useError } from "../../context/ErrorContext";
import { requestEmailChange } from "../../api/authApi";
import {Link} from "react-router-dom";

export default function Safety() {
    const storedInitial = getUserData();
    const { showMessage, showError } = useError();

    const [email, setEmail] = useState(storedInitial?.email || "");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [apiKey, setApiKey] = useState(storedInitial?.deeplKey || "");
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // Sync fields with localStorage changes
    useEffect(() => {
        const onStorage = () => {
            const stored = getUserData();
            setEmail(stored?.email || "");
            setApiKey(stored?.deeplKey || "");
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const handleSend = async () => {
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


    const handleSaveApiKey = (val) => {
        setApiKey(val);
        const updated = { ...getUserData(), deeplKey: val };
        saveUserData(updated);
        window.dispatchEvent(new Event("storage"));
    };

    const apiKeyStatus = apiKey ? "active key" : "no key";

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
                        onClick={handleSend}
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
                    <EditableField type="text" value={apiKeyStatus} editable={false} />
                </label>

                <label>
                    New DeepL API key
                    <EditableField type="text" value={apiKey} onSave={handleSaveApiKey} />
                </label>

                <div className="button-wrapper">
                    <Button
                        variant="toggle"
                        color="var(--accent)"
                        width="170px"
                        height="46px"
                        onClick={() => {
                            handleSaveApiKey(apiKey);
                            showMessage("DeepL key saved.", "success");
                        }}
                    >
                        Save key
                    </Button>

                    <Button
                        variant="toggle"
                        color="var(--danger)"
                        width="170px"
                        height="46px"
                        onClick={() => {
                            handleSaveApiKey("");
                            showMessage("DeepL key deleted.", "success");
                        }}
                    >
                        Delete DeepL key
                    </Button>
                </div>
            </div>
        </div>
    );
}