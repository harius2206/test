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
import { verifyEmail, githubLogin, googleLogin } from "../../../api/authApi";
import { setTokens } from "../../../utils/storage";
import { fetchCurrentUser } from "../../../api/profileApi";
import { ReactComponent as EyeOpen } from "../../../images/eyeOpened.svg";
import { ReactComponent as EyeClosed } from "../../../images/eyeClosed.svg";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, setUser } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const [form, setForm] = useState({ username: "", password: "" });
    const [modal, setModal] = useState({ open: false, type: "error", message: "" });
    const [showPassword, setShowPassword] = useState(false);

    /* ===========================
       OAuth Callback Logic
    ============================ */
    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) return;

        const isGitHub = window.location.pathname.includes("github");
        const isGoogle = window.location.pathname.includes("google");

        (async () => {
            try {
                // 1. Exchange code → tokens
                const res = isGitHub
                    ? await githubLogin(code)
                    : await googleLogin(code);

                const { access, refresh } = res.data;

                // 2. Зберігаємо токени
                setTokens(access, refresh);

                // 3. тягнемо деталі профілю
                const userResp = await fetchCurrentUser();
                const fullUser = userResp.data;

                // 4. зберігаємо у контекст
                setUser(fullUser);

                navigate("/", { replace: true });
            } catch (err) {
                console.error("OAuth login failed:", err);
                setModal({
                    open: true,
                    type: "error",
                    message: isGoogle
                        ? "Google authorization failed. Please try again."
                        : "GitHub authorization failed. Please try again."
                });
            } finally {
                setSearchParams({});
            }
        })();
    }, [searchParams, navigate, setUser, setSearchParams]);


    /* ===========================
       Email verification
    ============================ */
    useEffect(() => {
        const key = searchParams.get("key");
        if (!key) return;

        (async () => {
            try {
                await verifyEmail(key);
                setModal({
                    open: true,
                    type: "success",
                    message: "Your account has been successfully verified!"
                });
            } catch (err) {
                setModal({
                    open: true,
                    type: "error",
                    message: "Account verification failed. Please try again."
                });
            } finally {
                setSearchParams({});
            }
        })();
    }, [searchParams, setSearchParams]);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    /* ===========================
       Regular Login
    ============================ */
    const handleLogin = async () => {
        if (!form.username.trim() || !form.password.trim()) {
            setModal({
                open: true,
                type: "error",
                message: "Please enter your username and password."
            });
            return;
        }

        try {
            await login(form); // <-- ТУТ ВЖЕ ВСЕ РОБИТЬСЯ АВТОМАТИЧНО
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
            const apiErrors = err?.data || err?.response?.data || {};

            if (apiErrors.non_field_errors?.[0]) {
                setModal({
                    open: true,
                    type: "error",
                    message: "Incorrect username or password."
                });
            } else {
                const parsed = parseApiErrors(apiErrors);
                const message = Array.isArray(parsed) ? parsed.join(" ") : parsed;

                setModal({
                    open: true,
                    type: "error",
                    message: message || "An unexpected error occurred. Please try again."
                });
            }
        }
    };


    /* ===========================
       OAuth Buttons
    ============================ */
    const handleGitHubLogin = () => {
        const clientId = "Ov23lih0hmDrxiIyvXiN";
        const redirectUri = "http://localhost:3000/github/callback";
        const scope = "read:user user:email";

        window.location.href =
            `https://github.com/login/oauth/authorize?client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${encodeURIComponent(scope)}` +
            `&allow_signup=true&prompt=consent`;
    };

    const handleGoogleLogin = () => {
        const clientId = "86692327760-lm1rijlk59sbq9hg2jm9o858a6b8ohhn.apps.googleusercontent.com";
        const redirectUri = "http://localhost:3000/google/callback/";

        window.location.href =
            `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
            `&redirect_uri=${redirectUri}` +
            `&response_type=code&scope=openid profile email&prompt=select_account`;
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
                width="340px"
                height="40px"
            >
                Log in
            </Button>

            <div className="login-divider">
                <span>or</span>
            </div>

            <div className="login-socials">
                <button className="login-social-btn" onClick={handleGitHubLogin}>
                    <img src={githubIcon} alt="GitHub" />
                </button>

                <button className="login-social-btn" onClick={handleGoogleLogin}>
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
