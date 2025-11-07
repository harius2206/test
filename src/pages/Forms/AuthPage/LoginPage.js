// src/pages/Forms/AuthPage/LoginPage.js
import React, { useState } from "react";
import "./loginPage.css";
import { useNavigate, Link } from "react-router-dom";
import githubIcon from "../../../images/github.svg";
import googleIcon from "../../../images/google.svg";
import Button from "../../../components/button/button";

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ identifier: "", password: "" });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogin = () => {
        if (!form.identifier.trim() || !form.password.trim()) {
            alert("Please enter your email/username and password");
            return;
        }

        console.log("Login data:", form);
        navigate("/");
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Log in</h2>

            <input
                className="login-input"
                name="identifier"
                placeholder="Email or username"
                value={form.identifier}
                onChange={handleChange}
            />
            <input
                className="login-input"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
            />

            <p className="reset-footer">
                <Link to="/reset-password" className="login-link">
                    Forgot password?
                </Link>
            </p>

            <Button onClick={handleLogin} variant="static" color="var(--bg-button)" width="340px" height="40px">
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
        </div>
    );
}