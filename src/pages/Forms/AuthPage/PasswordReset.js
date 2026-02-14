import React, { useState, useEffect } from "react";
import "./loginPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../../components/button/button";
import { requestPasswordReset, confirmPasswordReset } from "../../../api/authApi";
import { useError } from "../../../context/ErrorContext";
import { savePendingEmail, getPendingEmail } from "../../../utils/storage";
import { useI18n } from "../../../i18n";

export default function PasswordReset() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showError, showMessage, showApiErrors } = useError();
    const { t } = useI18n();

    // === State
    const [pr_step, pr_setStep] = useState(1);
    const [pr_form, pr_setForm] = useState({
        email: getPendingEmail() || "",
        password: "",
        confirm: ""
    });
    const [pr_uid, pr_setUid] = useState("");
    const [pr_token, pr_setToken] = useState("");
    const [pr_loading, pr_setLoading] = useState(false);

    // === Handlers
    const pr_handleChange = (e) =>
        pr_setForm({ ...pr_form, [e.target.name]: e.target.value });

    // === Check if opened via email link
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const uidParam = params.get("uid");
        const tokenParam = params.get("token");

        if (uidParam && tokenParam) {
            pr_setUid(uidParam);
            pr_setToken(tokenParam);
            pr_setStep(2);
        }
    }, [location.search]);

    // === Send reset email
    const pr_handleSend = async () => {
        if (!pr_form.email.trim()) {
            showError(t("enterRegisteredEmail"));
            return;
        }

        pr_setLoading(true);

        try {
            const res = await requestPasswordReset(pr_form.email);
            savePendingEmail(pr_form.email);

            showMessage(res?.data?.detail || t("checkYourEmail"), "success");

            if (!pr_uid && !pr_token) pr_setStep(2);
        } catch (err) {
            showApiErrors(err, t("sendResetFailed"));
        } finally {
            pr_setLoading(false);
        }
    };

    // === Apply new password
    const pr_handleApply = async () => {
        if (!pr_form.password.trim() || !pr_form.confirm.trim()) {
            showError(t("fillBothFields"));
            return;
        }

        if (pr_form.password !== pr_form.confirm) {
            showError(t("passwordsDoNotMatch"));
            return;
        }

        pr_setLoading(true);

        try {
            const payload = {
                uid: pr_uid,
                token: pr_token,
                new_password1: pr_form.password,
                new_password2: pr_form.confirm,
            };

            const res = await confirmPasswordReset(payload);
            showMessage(res?.data?.detail || t("passwordResetSuccess"), "success");

            savePendingEmail(null);
            navigate("/");
        } catch (err) {
            showApiErrors(err, t("passwordResetFailed"));
        } finally {
            pr_setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">{t("passwordReset")}</h2>

            {pr_step === 1 ? (
                <>
                    <p className="reset-description">{t("enterEmailForReset")}</p>

                    <input
                        className="login-input"
                        name="email"
                        placeholder={t("emailAddress")}
                        value={pr_form.email}
                        onChange={pr_handleChange}
                    />

                    <Button
                        onClick={pr_handleSend}
                        variant="static"
                        width="340px"
                        height="40px"
                        disabled={pr_loading}
                    >
                        {pr_loading ? t("sending") : t("send")}
                    </Button>
                </>
            ) : (
                <>
                    <input
                        className="login-input"
                        type="password"
                        name="password"
                        placeholder={t("enterNewPassword")}
                        value={pr_form.password}
                        onChange={pr_handleChange}
                    />

                    <input
                        className="login-input"
                        type="password"
                        name="confirm"
                        placeholder={t("confirmNewPassword")}
                        value={pr_form.confirm}
                        onChange={pr_handleChange}
                    />

                    <Button
                        onClick={pr_handleApply}
                        variant="static"
                        width="340px"
                        height="40px"
                        disabled={pr_loading}
                    >
                        {pr_loading ? t("saving") : t("apply")}
                    </Button>

                    <p className="reset-footer">
                        {t("didntReceiveEmail")}{" "}
                        <span className="login-link" onClick={pr_handleSend}>
                            {t("sendAgain")}
                        </span>
                    </p>
                </>
            )}
        </div>
    );
}
