import React, { createContext, useState, useLayoutEffect } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
    );

    useLayoutEffect(() => {
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
