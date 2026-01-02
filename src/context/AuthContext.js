import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../api/authApi";
import {
    saveAuthTokens,
    getUserData,
    saveUserData,
    clearAuthData,
} from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Синхронна ініціалізація user (як ми робили раніше)
    const [user, setUser] = useState(() => getUserData());

    // 2. Додаємо стан "глобального завантаження"
    const [loading, setLoading] = useState(true);

    /* ==== LOGIN ==== */
    const login = async (credentials) => {
        try {
            const res = await loginUser(credentials);
            const { access, refresh, user } = res.data;

            saveAuthTokens(access, refresh);
            saveUserData(user);
            setUser(user);

            window.dispatchEvent(new Event("storage"));
            return user;
        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        }
    };

    /* ==== REGISTER ==== */
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

    /* ==== LOGOUT ==== */
    const logout = () => {
        clearAuthData();
        setUser(null);
        window.dispatchEvent(new Event("storage"));
    };

    /* ==== INITIALIZATION ==== */
    useEffect(() => {
        // Тут можна додати перевірку валідності токена на бекенді, якщо потрібно.
        // Наразі ми просто даємо React час змонтувати все і вимикаємо лоадер.
        // Це прибере ефект "почергової появи" компонентів.
        const init = () => {
            const storedUser = getUserData();
            if (storedUser) setUser(storedUser);
            setLoading(false); // Додаток готовий до показу
        };

        init();

        const onStorage = () => {
            const updated = getUserData();
            setUser(updated);
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Якщо додаток ще ініціалізується — показуємо спінер або просто порожній екран
    if (loading) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "var(--bg-main)" // Використовуємо колір фону теми
            }}>
                {/* Можна додати красивий спінер тут */}
                <span>Loading...</span>
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