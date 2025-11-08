import React, { useState, useContext, useEffect } from "react";
import "./loginPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser, verifyEmail } from "../../../api/authApi";
import { AuthContext } from "../../../context/AuthContext";
import ErrorModal from "../../../components/ErrorModal/ErrorModal";
import githubIcon from "../../../images/github.svg";
import googleIcon from "../../../images/google.svg";

export default function RegisterPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);

    // 🔹 1. якщо користувач відкрив лінк з пошти (http://localhost:3000/?key=...)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");

        if (key) {
            (async () => {
                setLoading(true);
                try {
                    const res = await verifyEmail(key);
                    if (res?.data?.detail) {
                        setInfo("Account verified successfully");
                    } else {
                        setInfo("Account verified successfully");
                    }
                } catch (err) {
                    const msg =
                        err?.response?.data?.detail ||
                        err?.response?.data ||
                        "Email not verified";
                    setError(msg);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, []);

    // 🔹 2. хендлер форми реєстрації
    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password1 !== form.password2) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            const res = await registerUser(form);
            const data = res?.data || res;
            console.log("Register success:", data);

            if (data?.access && data?.refresh) {
                login(data);
                navigate("/");
            } else {
                if (form.email) {
                    setInfo("Verification email sent. Check your inbox.");
                } else {
                    setInfo("Account registered successfully");
                }
            }
        } catch (err) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data ||
                err?.message ||
                "Registration error";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 3. рендер
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
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <input
                    className="login-input"
                    type="email"
                    name="email"
                    placeholder="Email (optional)"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    className="login-input"
                    type="password"
                    name="password1"
                    placeholder="Password"
                    value={form.password1}
                    onChange={handleChange}
                    required
                />

                <input
                    className="login-input"
                    type="password"
                    name="password2"
                    placeholder="Confirm password"
                    value={form.password2}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    className="login-main-btn"
                    disabled={loading}
                    style={{ width: "100%", maxWidth: 340 }}
                >
                    {loading ? "Processing..." : "Register"}
                </button>
            </form>

            {/* 🔹 повідомлення */}
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
                <button className="login-social-btn" type="button" aria-label="GitHub">
                    <img src={githubIcon} alt="GitHub" />
                </button>
                <button className="login-social-btn" type="button" aria-label="Google">
                    <img src={googleIcon} alt="Google" />
                </button>
            </div>

            <p className="login-footer">
                Already have an account?{" "}
                <span className="login-link" onClick={() => navigate("/login")}>
          Sign in
        </span>
            </p>

            <ErrorModal error={error} onClose={() => setError(null)} />
        </div>
    );
}
