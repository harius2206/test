// src/pages/Forms/AuthPage/LoginPage.js
import React, { useState, useContext, useEffect } from "react";
import "./loginPage.css";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import githubIcon from "../../../images/github.svg";
import googleIcon from "../../../images/google.svg";
import Button from "../../../components/button/button";
import { AuthContext } from "../../../context/AuthContext";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import { parseApiErrors } from "../../../utils/parseApiErrors";
import { verifyEmail } from "../../../api/authApi";
import { ReactComponent as EyeOpen } from "../../../images/eyeOpened.svg";
import { ReactComponent as EyeClosed } from "../../../images/eyeClosed.svg";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const [form, setForm] = useState({ username: "", password: "" });
    const [modal, setModal] = useState({ open: false, type: "error", message: "" });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const key = searchParams.get("key");
        if (!key) return;

        (async () => {
            try {
                await verifyEmail(key);
                setModal({
                    open: true,
                    type: "success",
                    message: "Your account has been successfully verified! You can now log in.",
                });
                setSearchParams({});
            } catch (err) {
                console.error("Email verification failed:", err);
                setModal({
                    open: true,
                    type: "error",
                    message: "Account verification failed. Please try again later.",
                });
            }
        })();
    }, [searchParams, setSearchParams]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogin = async () => {
        if (!form.username.trim() || !form.password.trim()) {
            setModal({ open: true, type: "error", message: "Please enter your username and password." });
            return;
        }

        try {
            await login(form);
            navigate("/main", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            const apiErrors = err?.data || err?.response?.data || {};

            if (apiErrors.non_field_errors?.[0]) {
                setModal({
                    open: true,
                    type: "error",
                    message: "Incorrect username or password.",
                });
            } else {
                const parsed = parseApiErrors(apiErrors);
                const message = Array.isArray(parsed) ? parsed.join(" ") : parsed;
                setModal({
                    open: true,
                    type: "error",
                    message: message || "An unexpected error occurred. Please try again.",
                });
            }
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Log in</h2>

            <input
                className="login-input"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
            />

            <div className="password-wrapper">
                <input
                    className="login-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                />
                <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword((s) => !s)}
                    role="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                </span>
            </div>

            <p className="reset-footer">
                <Link to="/reset-password" className="login-link">
                    Forgot password?
                </Link>
            </p>

            <Button
                onClick={handleLogin}
                variant="static"
                color="var(--bg-button)"
                width="340px"
                height="40px"
            >
                Log in
            </Button>

            <div className="login-divider">
                <span>or</span>
            </div>

            <div className="login-socials">
                <button className="login-social-btn" aria-label="Sign in with GitHub">
                    <img src={githubIcon} alt="GitHub" />
                </button>
                <button className="login-social-btn" aria-label="Sign in with Google">
                    <img src={googleIcon} alt="Google" />
                </button>
            </div>

            <p className="login-footer">
                Don’t have an account?{" "}
                <span className="login-link" onClick={() => navigate("/register")}>
                    Register
                </span>
            </p>

            <ModalMessage
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />
        </div>
    );
}