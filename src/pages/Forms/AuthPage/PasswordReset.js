// src/pages/Forms/AuthPage/PasswordReset.js
import React, { useState } from "react";
import "./loginPage.css";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/button";

export default function PasswordReset() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ email: "", password: "", confirm: "" });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSend = () => {
        if (!form.email.trim()) {
            alert("Please enter your registered email address");
            return;
        }
        // Тут можна буде додати API для відправки коду на пошту
        setStep(2);
    };

    const handleApply = () => {
        if (!form.password || form.password !== form.confirm) {
            alert("Passwords do not match");
            return;
        }
        // Тут буде логіка зміни пароля через бекенд
        alert("Password successfully reset!");
        navigate("/login");
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Password reset</h2>

            {step === 1 ? (
                <>
                    <p className="reset-description">
                        Enter the registered email address to which the password change code will be sent.
                    </p>
                    <input
                        className="login-input"
                        name="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <Button onClick={handleSend} variant="static" color="var(--bg-button)" width="340px" height="40px">
                        Send
                    </Button>
                </>
            ) : (
                <>
                    <input
                        className="login-input"
                        type="password"
                        name="password"
                        placeholder="Enter new password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    <input
                        className="login-input"
                        type="password"
                        name="confirm"
                        placeholder="Confirm new password"
                        value={form.confirm}
                        onChange={handleChange}
                    />
                    <Button onClick={handleApply} variant="static" color="var(--bg-button)" width="340px" height="40px">
                        Apply
                    </Button>

                    <p className="reset-footer">
                        Didn’t receive the email?{" "}
                        <span className="login-link" onClick={handleSend}>
                            Send again
                        </span>
                    </p>
                </>
            )}
        </div>
    );
}