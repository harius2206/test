import { useState, useEffect } from "react";
import Button from "../../components/button/button";
import EditableField from "../../components/editableField/editableField";
import { getUserData, saveUserData } from "../../utils/storage";
import "./profile.css";

export default function Safety() {
    const stored = getUserData();
    const [email, setEmail] = useState(stored?.email || "");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [apiKey, setApiKey] = useState(stored?.deeplKey || "");
    const [cooldown, setCooldown] = useState(0);

    const handleSend = () => {
        if (cooldown === 0) setCooldown(30);
    };

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleSaveEmail = (val) => {
        setEmail(val);
        const updated = { ...stored, email: val };
        saveUserData(updated);
    };

    const handleSaveApiKey = (val) => {
        setApiKey(val);
        const updated = { ...stored, deeplKey: val };
        saveUserData(updated);
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
                        onSave={handleSaveEmail}
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
                        onClick={() =>
                            console.log("Change password:", {
                                password,
                                newPassword,
                                confirmPassword,
                            })
                        }
                    >
                        Change password
                    </Button>

                    <Button variant="toggle" color="var(--accent)" width="170px" height="46px">
                        Forgot password
                    </Button>
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
                        onClick={() => console.log("Save key:", apiKey)}
                    >
                        Save key
                    </Button>

                    <Button
                        variant="toggle"
                        color="var(--danger)"
                        width="170px"
                        height="46px"
                        onClick={() => handleSaveApiKey("")}
                    >
                        Delete DeepL key
                    </Button>
                </div>
            </div>
        </div>
    );
}
