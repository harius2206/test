import React, { createContext, useState, useEffect } from "react";
import { getAccessToken, setTokens, clearTokens } from "../utils/storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = (data) => {
        setTokens(data.access, data.refresh);
        setUser(data.user || null);
    };

    const logout = () => {
        clearTokens();
        setUser(null);
    };

    useEffect(() => {
        const token = getAccessToken();
        if (token) setUser({ token });
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
