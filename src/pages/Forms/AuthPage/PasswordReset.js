// src/pages/Forms/AuthPage/PasswordReset.js
import React, { useState, useEffect } from "react";
import "./loginPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../../components/button/button";
import { requestPasswordReset, confirmPasswordReset } from "../../../api/authApi";
import { useError } from "../../../context/ErrorContext";

import {
    savePendingEmail,
    getPendingEmail
} from "../../../utils/storage";

export default function PasswordReset() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showError, showMessage, showApiErrors } = useError();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        email: getPendingEmail() || "",
        password: "",
        confirm: ""
    });

    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    /* ==========================
       CHECK IF OPENED FROM EMAIL
    =========================== */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const uidParam = params.get("uid");
        const tokenParam = params.get("token");

        if (uidParam && tokenParam) {
            setUid(uidParam);
            setToken(tokenParam);
            setStep(2);
        }
    }, [location.search]);

    /* ==========================
       SEND RESET EMAIL
    =========================== */
    const handleSend = async () => {
        if (!form.email.trim()) {
            showError("Please enter your registered email address");
            return;
        }

        setLoading(true);

        try {
            const res = await requestPasswordReset(form.email);

            savePendingEmail(form.email);

            showMessage(res?.data?.detail || "Check your email!", "success");

            // Move to next step ONLY if not opened via email link
            if (!uid && !token) setStep(2);
        } catch (err) {
            showApiErrors(err, "Failed to send password reset email.");
        } finally {
            setLoading(false);
        }
    };

    /* ==========================
       APPLY NEW PASSWORD
    =========================== */
    const handleApply = async () => {
        if (!form.password.trim() || !form.confirm.trim()) {
            showError("Please fill in both fields");
            return;
        }

        if (form.password !== form.confirm) {
            showError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                uid,
                token,
                new_password1: form.password,
                new_password2: form.confirm,
            };

            const res = await confirmPasswordReset(payload);

            showMessage(res?.data?.detail || "Password successfully reset!", "success");

            // 💾 Clear saved email after success
            savePendingEmail(null);

            navigate("/");
        } catch (err) {
            showApiErrors(err, "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Password reset</h2>

            {step === 1 ? (
                <>
                    <p className="reset-description">
                        Enter the registered email address to which the password reset link will be sent.
                    </p>

                    <input
                        className="login-input"
                        name="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <Button
                        onClick={handleSend}
                        variant="static"
                        width="340px"
                        height="40px"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send"}
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

                    <Button
                        onClick={handleApply}
                        variant="static"
                        width="340px"
                        height="40px"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Apply"}
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
