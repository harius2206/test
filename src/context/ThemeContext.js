import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const setLight = () => setTheme("light");
    const setDark = () => setTheme("dark");

    return (
        <ThemeContext.Provider value={{ theme, setLight, setDark }}>
            {children}
        </ThemeContext.Provider>
    );
}
