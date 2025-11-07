import React, { useState } from "react";
import "./loginPage.css";
import { useNavigate } from "react-router-dom";
import githubIcon from "../../../images/github.svg";
import googleIcon from "../../../images/google.svg";
import Button from "../../../components/button/button";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleNext = () => {
        if (form.username.trim() && form.email.trim()) {
            setStep(2);
        } else {
            alert("Please fill in username and email");
        }
    };

    const handleRegister = () => {
        if (!form.password || form.password !== form.confirm) {
            alert("Passwords do not match");
            return;
        }

        const userData = { username: form.username, email: form.email };
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event("storage"));
        navigate("/");
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Create account</h2>

            {step === 1 ? (
                <>
                    <input
                        className="login-input"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                    />
                    <input
                        className="login-input"
                        name="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <Button onClick={handleNext} variant="static" color="var(--bg-button)" width="340px" height="40px">
                        Continue
                    </Button>
                </>
            ) : (
                <>
                    <input
                        className="login-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    <input
                        className="login-input"
                        type="password"
                        name="confirm"
                        placeholder="Confirm password"
                        value={form.confirm}
                        onChange={handleChange}
                    />
                    <Button onClick={handleRegister} variant="static" color="var(--bg-button)" width="340px" height="40px">
                        Create account
                    </Button>
                </>
            )}

            <div className="login-divider">
                <span>or</span>
            </div>

            <div className="login-socials">
                <button className="login-social-btn">
                    <img src={githubIcon} alt="GitHub" />
                </button>
                <button className="login-social-btn">
                    <img src={googleIcon} alt="Google" />
                </button>
            </div>

            <p className="login-footer">
                Already have an account?{" "}
                <span className="login-link" onClick={() => navigate("/login")}>
                    Log in
                </span>
            </p>
        </div>
    );
}