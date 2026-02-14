import React, { useState, useContext, useEffect } from "react";
import "./loginPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser, verifyEmail } from "../../../api/authApi";
import { AuthContext } from "../../../context/AuthContext";
import githubIcon from "../../../images/github.svg";
import googleIcon from "../../../images/google.svg";
import { useError } from "../../../context/ErrorContext";
import { ReactComponent as EyeOpen } from "../../../images/eyeOpened.svg";
import { ReactComponent as EyeClosed } from "../../../images/eyeClosed.svg";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import { useI18n } from "../../../i18n";

const PASSWORD_HINT = {
    too_common: "Password must not be too common.",
    too_short: "Password must be at least 8 characters long.",
    too_similar: "Password is too similar to username or email.",
    entirely_numeric: "Password cannot be entirely numeric.",
    invalid: "Password must be 8+ characters, not too common, and not entirely numeric.",
};

export default function RegisterPage() {
    const { login } = useContext(AuthContext);
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const { showError, showMessage } = useError();

    const [rpForm, rpSetForm] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
    });

    const [rpFieldErrors, rpSetFieldErrors] = useState({});
    const [rpLoading, rpSetLoading] = useState(false);
    const [rpInfo, rpSetInfo] = useState(null);
    const [rpShowPasswords, rpSetShowPasswords] = useState(false);

    const [rpModalError, rpSetModalError] = useState({
        open: false,
        message: ""
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");

        if (key) {
            (async () => {
                rpSetLoading(true);
                try {
                    await verifyEmail(key);
                    rpSetInfo(t("rpAccountVerified"));
                } catch (err) {
                    showError(err);
                } finally {
                    rpSetLoading(false);
                }
            })();
        }
    }, [showError, t]);

    const rpHandleChange = (e) => {
        const { name, value } = e.target;

        rpSetForm({ ...rpForm, [name]: value });

        if (rpFieldErrors[name]) {
            rpSetFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const normalizePasswordError = (errorText) => {
        const text = errorText.toLowerCase();

        if (text.includes("too common")) return PASSWORD_HINT.too_common;
        if (text.includes("too short")) return PASSWORD_HINT.too_short;
        if (text.includes("similar")) return PASSWORD_HINT.too_similar;
        if (text.includes("numeric")) return PASSWORD_HINT.entirely_numeric;
        return PASSWORD_HINT.invalid;
    };

    const rpHandleSubmit = async (e) => {
        e.preventDefault();
        rpSetFieldErrors({});

        if (rpForm.username.length > 20) {
            rpSetModalError({
                open: true,
                message: t("rpUsernameTooLong")
            });
            return;
        }

        if (rpForm.password1 !== rpForm.password2) {
            rpSetFieldErrors({ password2: t("rpPasswordsDoNotMatch") });
            return;
        }

        try {
            rpSetLoading(true);
            await registerUser({
                username: rpForm.username,
                email: rpForm.email,
                password1: rpForm.password1,
                password2: rpForm.password2,
            });
            showMessage(t("rpRegistrationSuccess"), "success");
        } catch (err) {
            const data = err?.response?.data || err?.data;
            if (data && typeof data === "object") {
                const newErrors = {};

                ["username", "email", "password1", "password2"].forEach((key) => {
                    if (data[key]) {
                        let value = Array.isArray(data[key])
                            ? data[key].join(" ")
                            : String(data[key]);

                        if (key.includes("password")) {
                            value = normalizePasswordError(value);
                        }

                        newErrors[key] = value;
                    }
                });

                if (data.non_field_errors) {
                    const nonField = Array.isArray(data.non_field_errors)
                        ? data.non_field_errors.join(" ")
                        : data.non_field_errors;
                    newErrors.password2 = nonField;
                }

                if (Object.keys(newErrors).length === 0) {
                    newErrors.general =
                        data.detail || t("rpRegistrationFailed");
                }

                rpSetFieldErrors(newErrors);
            } else {
                showError(err);
            }
        } finally {
            rpSetLoading(false);
        }
    };

    const rpHandleGitHubLogin = () => {
        const clientId = "Ov23lih0hmDrxiIyvXiN";
        const redirectUri = "http://localhost:3000/github/callback";
        const scope = "read:user user:email";
        const allowSignup = true;
        const prompt = "consent";

        window.location.href =
            `https://github.com/login/oauth/authorize?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${encodeURIComponent(scope)}` +
            `&allow_signup=${allowSignup}` +
            `&prompt=${prompt}`;
    };

    const rpHandleGoogleLogin = () => {
        const clientId = "86692327760-lm1rijlk59sbq9hg2jm9o858a6b8ohhn.apps.googleusercontent.com";
        const redirectUri = "http://localhost:3000/google/callback/";
        const scope = "openid profile email";
        const responseType = "code";
        const prompt = "select_account";

        window.location.href =
            `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=${prompt}`;
    };

    return (
        <div className="login-container">
            <h2 className="login-title">{t("rpRegistration")}</h2>

            <form
                className="register-form"
                onSubmit={rpHandleSubmit}
                style={{
                    width: "100%",
                    maxWidth: 340,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <input
                    className="login-input"
                    type="text"
                    name="username"
                    placeholder={t("rpUsernamePlaceholder")}
                    value={rpForm.username}
                    onChange={rpHandleChange}
                    required
                />
                {rpFieldErrors.username && (
                    <p className="field-error">{rpFieldErrors.username}</p>
                )}

                <input
                    className="login-input"
                    type="email"
                    name="email"
                    placeholder={t("rpEmailPlaceholder")}
                    value={rpForm.email}
                    onChange={rpHandleChange}
                />
                {rpFieldErrors.email && (
                    <p className="field-error">{rpFieldErrors.email}</p>
                )}

                <div className="password-wrapper">
                    <input
                        className="login-input"
                        type={rpShowPasswords ? "text" : "password"}
                        name="password1"
                        placeholder={t("rpPasswordPlaceholder")}
                        value={rpForm.password1}
                        onChange={rpHandleChange}
                        required
                    />
                    <span
                        className="password-toggle-icon"
                        onClick={() => rpSetShowPasswords(!rpShowPasswords)}
                    >
                        {rpShowPasswords ? <EyeOpen /> : <EyeClosed />}
                    </span>
                </div>
                {rpFieldErrors.password1 && (
                    <p className="field-error">{rpFieldErrors.password1}</p>
                )}

                <div className="password-wrapper">
                    <input
                        className="login-input"
                        type={rpShowPasswords ? "text" : "password"}
                        name="password2"
                        placeholder={t("rpConfirmPasswordPlaceholder")}
                        value={rpForm.password2}
                        onChange={rpHandleChange}
                        required
                    />
                </div>
                {rpFieldErrors.password2 && (
                    <p className="field-error">{rpFieldErrors.password2}</p>
                )}

                {rpFieldErrors.general && (
                    <p className="field-error">{rpFieldErrors.general}</p>
                )}

                <button
                    type="submit"
                    className="login-main-btn"
                    disabled={rpLoading}
                    style={{ width: "100%", maxWidth: 340 }}
                >
                    {rpLoading ? t("rpProcessing") : t("rpRegistration")}
                </button>
            </form>

            {rpInfo && (
                <p
                    style={{
                        marginTop: 10,
                        color: "#16a34a",
                        fontSize: 14,
                        textAlign: "center",
                    }}
                >
                    {rpInfo}
                </p>
            )}

            <div className="login-divider" style={{ maxWidth: 340 }}>
                <span>{t("rpOr")}</span>
            </div>

            <div className="login-socials">
                <button
                    className="login-social-btn"
                    type="button"
                    aria-label={t("rpGithubLogin")}
                    onClick={rpHandleGitHubLogin}
                >
                    <img src={githubIcon} alt="GitHub" />
                </button>
                <button
                    className="login-social-btn"
                    type="button"
                    aria-label={t("rpGoogleLogin")}
                    onClick={rpHandleGoogleLogin}
                >
                    <img src={googleIcon} alt="Google" />
                </button>
            </div>

            <p className="login-footer">
                {t("rpAlreadyHaveAccount")}{" "}
                <span className="login-link" onClick={() => navigate("/login")}>
                    {t("rpSignIn")}
                </span>
            </p>

            <ModalMessage
                open={rpModalError.open}
                type="error"
                message={rpModalError.message}
                onClose={() => rpSetModalError({ open: false, message: "" })}
            />
        </div>
    );
}