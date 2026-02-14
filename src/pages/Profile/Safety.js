import { useState, useEffect } from "react";
import Button from "../../components/button/button";
import EditableField from "../../components/editableField/editableField";
import { getUserData } from "../../utils/storage";
import "./profile.css";
import { changePassword } from "../../api/authApi";
import { useError } from "../../context/ErrorContext";
import { requestEmailChange } from "../../api/authApi";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import {
    getDeeplKeys,
    createDeeplKey,
    updateDeeplKey,
    deleteDeeplKey
} from "../../api/deeplApi";

export default function Safety() {
    const sfStoredInitial = getUserData();
    const { showMessage, showError } = useError();
    const { t } = useI18n();

    // Email & Password states
    const [sfEmail, sfSetEmail] = useState(sfStoredInitial?.email || "");
    const [sfPassword, sfSetPassword] = useState("");
    const [sfNewPassword, sfSetNewPassword] = useState("");
    const [sfConfirmPassword, sfSetConfirmPassword] = useState("");
    const [sfCooldown, sfSetCooldown] = useState(0);

    // DeepL states
    const [sfDeeplKey, sfSetDeeplKey] = useState("");
    const [sfExistingKeyObj, sfSetExistingKeyObj] = useState(null);
    const [sfLoadingKey, sfSetLoadingKey] = useState(false);

    // Timer for email cooldown
    useEffect(() => {
        if (sfCooldown > 0) {
            const timer = setInterval(() => sfSetCooldown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [sfCooldown]);

    // Sync email with localStorage changes
    useEffect(() => {
        const onStorage = () => {
            const stored = getUserData();
            sfSetEmail(stored?.email || "");
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Load DeepL Key on mount
    useEffect(() => {
        sfLoadDeepLKey();
    }, []);

    const sfLoadDeepLKey = async () => {
        try {
            const res = await getDeeplKeys();
            if (res.data && res.data.length > 0) {
                const keyData = res.data[0];
                sfSetExistingKeyObj(keyData);
                sfSetDeeplKey("");
            } else {
                sfSetExistingKeyObj(null);
            }
        } catch (err) {
            console.error("Failed to load DeepL key", err);
        }
    };

    const sfHandleSendEmail = async () => {
        if (!sfEmail) {
            showError(t("sfEmailEmptyError"));
            return;
        }

        try {
            await requestEmailChange(sfEmail);
            showMessage(t("sfVerificationEmailMsg"), "success");
            sfSetCooldown(30);
        } catch (err) {
            showError(err?.response?.data || t("sfEmailActionFailed"));
        }
    };

    const sfHandleSaveApiKey = async () => {
        if (!sfDeeplKey.trim()) {
            showError(t("sfApiKeyEmptyError") || "API key cannot be empty.");
            return;
        }

        sfSetLoadingKey(true);
        try {
            if (sfExistingKeyObj) {
                await updateDeeplKey(sfExistingKeyObj.id, sfDeeplKey);
                showMessage(t("sfApiKeyUpdatedSuccess") || "DeepL key updated successfully.", "success");
            } else {
                await createDeeplKey(sfDeeplKey);
                showMessage(t("sfApiKeyCreatedSuccess") || "DeepL key created successfully.", "success");
            }
            sfSetDeeplKey("");
            await sfLoadDeepLKey();
        } catch (err) {
            showError(err?.response?.data?.detail || t("sfApiKeySaveFailed") || "Failed to save DeepL key.");
        } finally {
            sfSetLoadingKey(false);
        }
    };

    const sfHandleDeleteApiKey = async () => {
        if (!sfExistingKeyObj) return;

        sfSetLoadingKey(true);
        try {
            await deleteDeeplKey(sfExistingKeyObj.id);
            sfSetExistingKeyObj(null);
            sfSetDeeplKey("");
            showMessage(t("sfApiKeyDeletedMsg") || "DeepL key deleted.", "success");
        } catch (err) {
            showError(err, t("sfApiKeyDeleteFailed") || "Failed to delete DeepL key.");
        } finally {
            sfSetLoadingKey(false);
        }
    };

    // Формуємо статус для відображення
    let sfApiKeyStatusText = t("sfNoKeyLabel") || "No key";
    if (sfExistingKeyObj) {
        if (sfExistingKeyObj.status) {
            sfApiKeyStatusText = `${sfExistingKeyObj.status}`;
            if (sfExistingKeyObj.remaining_characters !== undefined) {
                sfApiKeyStatusText += ` (${sfExistingKeyObj.remaining_characters} ${t("sfCharsLeftLabel") || "chars left"})`;
            }
        } else {
            sfApiKeyStatusText = t("sfActiveKeyLabel") || "Active key";
        }
    }

    return (
        <div className="profile-content">
            <h1 className="profile-title">{t("sfSafetyTitle")}</h1>
            <h2 className="profile-tile-description">{t("sfSafetySubtitle")}</h2>

            <div className="profile-form">
                <label>
                    {t("sfYourEmailLabel")}
                    <EditableField
                        type="text"
                        value={sfEmail}
                        autosave
                        onSave={sfSetEmail}
                    />
                </label>

                <p className="advice-message">
                    {t("sfEmailAdvice")}
                </p>

                <div className="button-wrapper">
                    <Button
                        variant="static"
                        color="var(--accent)"
                        onClick={sfHandleSendEmail}
                        disabled={sfCooldown > 0}
                        width="170px"
                        height="46px"
                    >
                        {sfCooldown > 0 ? t("sfWaitEmailBtn") : t("sfSendEmailBtn")}
                    </Button>
                    {sfCooldown > 0 && <span className="cooldown-text">{sfCooldown}s</span>}
                </div>

                <hr />

                <label>
                    {t("sfYourPasswordLabel")}
                    <EditableField type="password" value={sfPassword} onSave={sfSetPassword} />
                </label>

                <label>
                    {t("sfNewPasswordLabel")}
                    <EditableField type="password" value={sfNewPassword} onSave={sfSetNewPassword} />
                </label>

                <label>
                    {t("sfConfirmPasswordLabel")}
                    <EditableField type="password" value={sfConfirmPassword} onSave={sfSetConfirmPassword} />
                </label>

                <div className="button-wrapper">
                    <Button
                        variant="toggle"
                        color="var(--accent)"
                        width="170px"
                        height="46px"
                        onClick={async () => {
                            document.activeElement.blur();

                            if (!sfPassword || !sfNewPassword || !sfConfirmPassword) {
                                showError(t("sfAllFieldsError"));
                                return;
                            }

                            if (sfNewPassword !== sfConfirmPassword) {
                                showError(t("sfPasswordsMismatchError"));
                                return;
                            }

                            try {
                                await changePassword({
                                    old_password: sfPassword,
                                    new_password1: sfNewPassword,
                                    new_password2: sfConfirmPassword,
                                });

                                showMessage(t("sfPasswordChangedMsg"), "success");

                                sfSetPassword("");
                                sfSetNewPassword("");
                                sfSetConfirmPassword("");
                            } catch (err) {
                                showError(err, t("sfChangePasswordFailed") || "Failed to change password.");
                            }
                        }}
                    >
                        {t("sfChangePasswordBtn")}
                    </Button>

                    <Link to="/reset-password">
                        <Button variant="toggle" color="var(--accent)" width="170px" height="46px">
                            {t("sfForgotPasswordBtn")}
                        </Button>
                    </Link>
                </div>

                <hr />

                <label>
                    {t("sfApiKeyStatusLabel")}
                    <EditableField type="text" value={sfApiKeyStatusText} editable={false} />
                </label>

                <label>
                    {sfExistingKeyObj ? t("sfUpdateApiKeyLabel") : t("sfAddApiKeyLabel")}
                    <EditableField
                        type="text"
                        value={sfDeeplKey}
                        autosave
                        onSave={sfSetDeeplKey}
                        placeholder={sfExistingKeyObj ? t("sfEnterNewKeyPlaceholder") : t("sfEnterKeyPlaceholder")}
                    />
                </label>

                <div className="button-wrapper">
                    <Button
                        variant="toggle"
                        color="var(--accent)"
                        width="170px"
                        height="46px"
                        disabled={sfLoadingKey}
                        onClick={() => {
                            document.activeElement.blur();
                            setTimeout(sfHandleSaveApiKey, 0);
                        }}
                    >
                        {sfLoadingKey ? t("sfSavingKeyBtn") || "Saving..." : (sfExistingKeyObj ? t("sfUpdateKeyBtn") : t("sfSaveKeyBtn"))}
                    </Button>

                    {sfExistingKeyObj && (
                        <Button
                            variant="toggle"
                            color="var(--danger)"
                            width="170px"
                            height="46px"
                            disabled={sfLoadingKey}
                            onClick={sfHandleDeleteApiKey}
                        >
                            {sfLoadingKey ? t("sfDeletingKeyBtn") : t("sfDeleteKeyBtn") || "Delete DeepL key"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}