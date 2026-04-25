import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../api/authApi";
import {
    saveAuthTokens,
    getUserData,
    saveUserData,
    clearAuthData,
} from "../utils/storage";
import { useI18n } from "../i18n";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getUserData());

    const [loading, setLoading] = useState(true);

    const { t } = useI18n();

    const login = async (credentials) => {
        try {
            const res = await loginUser(credentials);
            const { access, refresh, user: userData } = res.data;

            saveAuthTokens(access, refresh);
            saveUserData(userData);
            setUser(userData);

            window.dispatchEvent(new Event("storage"));
            return userData;
        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        }
    };

    const register = async (data) => {
        try {
            clearAuthData();
            const res = await registerUser(data);
            return res.data;
        } catch (err) {
            clearAuthData();
            console.error("Register failed:", err);
            throw err;
        }
    };

    const logout = () => {
        clearAuthData();
        setUser(null);
        window.dispatchEvent(new Event("storage"));
    };

    useEffect(() => {
        const init = () => {
            const storedUser = getUserData();
            if (storedUser) setUser(storedUser);
            setLoading(false);
        };

        init();

        const onStorage = () => {
            const updated = getUserData();
            setUser(updated);
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    if (loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-main)"
            }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 500 }}>
                    {t("authLoading_label")}
                </span>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);