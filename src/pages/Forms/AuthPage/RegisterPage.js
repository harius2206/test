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

const PASSWORD_HINT = {
    too_common: "Password must not be too common.",
    too_short: "Password must be at least 8 characters long.",
    too_similar: "Password is too similar to username or email.",
    entirely_numeric: "Password cannot be entirely numeric.",
    invalid: "Password must be 8+ characters, not too common, and not entirely numeric.",
};

export default function RegisterPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { showError, showMessage } = useError();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [info, setInfo] = useState(null);
    const [showPasswords, setShowPasswords] = useState(false);

    const [modalError, setModalError] = useState({
        open: false,
        message: ""
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");

        if (key) {
            (async () => {
                setLoading(true);
                try {
                    await verifyEmail(key);
                    setInfo("Account verified successfully");
                } catch (err) {
                    showError(err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [showError]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        if (formData.username.length > 20) {
            setModalError({
                open: true,
                message: "Username must be 20 characters or less."
            });
            return;
        }

        if (formData.password1 !== formData.password2) {
            setFieldErrors({ password2: "Passwords don’t match" });
            return;
        }

        try {
            setLoading(true);
            await registerUser({
                username: formData.username,
                email: formData.email,
                password1: formData.password1,
                password2: formData.password2,
            });
            showMessage("Registration successful! Please check your email.", "success");
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
                        data.detail || "Registration failed. Please check your data.";
                }

                setFieldErrors(newErrors);
            } else {
                showError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = () => {
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

    const handleGoogleLogin = () => {
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
            <h2 className="login-title">Registration</h2>

            <form
                className="register-form"
                onSubmit={handleSubmit}
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
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                {fieldErrors.username && (
                    <p className="field-error">{fieldErrors.username}</p>
                )}

                <input
                    className="login-input"
                    type="email"
                    name="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={handleChange}
                />
                {fieldErrors.email && (
                    <p className="field-error">{fieldErrors.email}</p>
                )}

                <div className="password-wrapper">
                    <input
                        className="login-input"
                        type={showPasswords ? "text" : "password"}
                        name="password1"
                        placeholder="Password"
                        value={formData.password1}
                        onChange={handleChange}
                        required
                    />
                    <span
                        className="password-toggle-icon"
                        onClick={() => setShowPasswords(!showPasswords)}
                    >
                        {showPasswords ? <EyeOpen /> : <EyeClosed />}
                    </span>
                </div>
                {fieldErrors.password1 && (
                    <p className="field-error">{fieldErrors.password1}</p>
                )}

                <div className="password-wrapper">
                    <input
                        className="login-input"
                        type={showPasswords ? "text" : "password"}
                        name="password2"
                        placeholder="Confirm password"
                        value={formData.password2}
                        onChange={handleChange}
                        required
                    />
                </div>
                {fieldErrors.password2 && (
                    <p className="field-error">{fieldErrors.password2}</p>
                )}

                {fieldErrors.general && (
                    <p className="field-error">{fieldErrors.general}</p>
                )}

                <button
                    type="submit"
                    className="login-main-btn"
                    disabled={loading}
                    style={{ width: "100%", maxWidth: 340 }}
                >
                    {loading ? "Processing..." : "Register"}
                </button>
            </form>

            {info && (
                <p
                    style={{
                        marginTop: 10,
                        color: "#16a34a",
                        fontSize: 14,
                        textAlign: "center",
                    }}
                >
                    {info}
                </p>
            )}

            <div className="login-divider" style={{ maxWidth: 340 }}>
                <span>or</span>
            </div>

            <div className="login-socials">
                <button
                    className="login-social-btn"
                    type="button"
                    aria-label="Sign in with GitHub"
                    onClick={handleGitHubLogin}
                >
                    <img src={githubIcon} alt="GitHub" />
                </button>
                <button
                    className="login-social-btn"
                    type="button"
                    aria-label="Sign in with Google"
                    onClick={handleGoogleLogin}
                >
                    <img src={googleIcon} alt="Google" />
                </button>
            </div>

            <p className="login-footer">
                Already have an account?{" "}
                <span className="login-link" onClick={() => navigate("/login")}>
                    Sign in
                </span>
            </p>

            <ModalMessage
                open={modalError.open}
                type="error"
                message={modalError.message}
                onClose={() => setModalError({ open: false, message: "" })}
            />
        </div>
    );
}
