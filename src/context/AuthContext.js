import React, { createContext, useState, useEffect } from "react";
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

    // 🔹 логін
    const login = async (credentials) => {
        try {
            const res = await loginUser(credentials);
            const { access, refresh, user } = res.data;

            // зберігаємо все
            saveAuthTokens(access, refresh);
            saveUserData(user);
            setUser(user);

            return user;
        } catch (err) {
            throw err;
        }
    };

    // 🔹 реєстрація — тепер чистимо токени перед дією
    const register = async (data) => {
        try {
            clearAuthData(); // <--- очищення перед запитом
            const res = await registerUser(data);
            return res.data;
        } catch (err) {
            clearAuthData(); // безпечне очищення навіть при помилці
            throw err;
        }
    };

    const logout = () => {
        clearAuthData();
        setUser(null);
    };

    useEffect(() => {
        const storedUser = getUserData();
        if (storedUser) setUser(storedUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
