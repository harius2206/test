import { useState, useEffect } from "react";
import Button from "../../components/button/button";
import EditableField from "../../components/editableField/editableField";
import "./profile.css";

export default function Safety() {
    const [email, setEmail] = useState("admin@gmail.com");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const handleSend = () => {
        if (cooldown === 0) {
            setCooldown(30);
        }
    };

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    return (
        <div className="profile-content">
            <h1 className={"profile-title"}>Safety</h1>
            <h2 className={"profile-tile-description"}>Here you can change your email or password</h2>

            <div className="profile-form">
                <label>
                    Your email
                    <EditableField
                        type="text"
                        value={email}
                        editable={true}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <p className={"advice-message"}>enter a new email, a confirmation message will be sent to it, after confirmation the email will be changed to the new one</p>
                <div className={"button-wrapper"}>
                    <Button
                        variant="static"
                        color="#6366f1"
                        onClick={handleSend}
                        disabled={cooldown > 0}
                        width="170px"
                        height="46px"
                    >
                        {cooldown > 0 ? "Wait..." : "Send"}
                    </Button>

                    {cooldown > 0 && (
                        <span style={{ fontSize: "16px", color: "#666" }}>
                            {cooldown}s
                        </span>
                    )}
                </div>

                <hr />

                <label>
                    Your password
                    <EditableField
                        type="password"
                        value={password}
                        editable={false}
                    />
                </label>

                <label>
                    New password
                    <EditableField
                        type="password"
                        value={newPassword}
                        editable={true}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </label>

                <label>
                    Confirm new password
                    <EditableField
                        type="password"
                        value={confirmPassword}
                        editable={true}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </label>

                <div className={"button-wrapper"}>
                    <Button
                        variant="toggle"
                        color="#6366f1"
                        width="170px"
                        height="46px"
                    >
                        Change password
                    </Button>
                    <Button
                        variant="toggle"
                        color="#6366f1"
                        width="170px"
                        height="46px"
                    >
                        Forgot password
                    </Button>
                </div>

                <hr />

                <label>
                    Your DeepL API key status
                    <div className="api-input active">active key</div>
                </label>

                <label>
                    New DeepL API key
                    <EditableField
                        type="text"
                        value={apiKey}
                        editable={true}
                    />
                </label>

                <div className={"button-wrapper"}>
                    <Button
                        variant="toggle"
                        color="#6366f1"
                        width="170px"
                        height="46px"
                    >
                        Save key
                    </Button>
                    <Button
                        variant="toggle"
                        color="#DF4C4C"
                        width="170px"
                        height="46px"
                    >
                        Delete DeepL key
                    </Button>
                </div>
            </div>
        </div>
    );
}
