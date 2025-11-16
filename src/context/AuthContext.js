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
    const [user, setUser] = useState(null);

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

    /* ==== LOAD ON START ==== */
    useEffect(() => {
        const storedUser = getUserData();
        if (storedUser) setUser(storedUser);

        const onStorage = () => {
            const updated = getUserData();
            setUser(updated);
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
