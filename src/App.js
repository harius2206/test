import React, { useEffect } from "react";
import ThemeProvider from "./context/ThemeContext";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import appRoutes from "./routes/appRoutes";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import SidePanel from "./components/sidePanel/sidePanel";
import { AuthProvider } from "./context/AuthContext";
import { ErrorProvider } from "./context/ErrorContext";
import AuthGuard from "./components/Auth/AuthGuard";
import { I18nProvider, useI18n } from "./i18n";
import LanguageModal from "./components/LanguageModal/LanguageModal";

function AppLayout() {
    const location = useLocation();
    const { isLangModalOpen } = useI18n();

    const hideSide =
        location.pathname.startsWith("/profile") ||
        location.pathname.startsWith("/login") ||
        location.pathname.startsWith("/register") ||
        location.pathname.startsWith("/reset-password");

    return (
        <div className="page-wrapper">
            <Header />
            <main className="content">
                {!hideSide && <SidePanel isLeftAligned={true} />}
                <div className="main-content">
                    <Routes>
                        {appRoutes.map(({ path, component: Component, protected: isProtected }) => {
                            const element = isProtected
                                ? <AuthGuard component={Component} />
                                : <Component />;

                            return (
                                <Route key={path} path={path} element={element} />
                            );
                        })}
                    </Routes>
                </div>
            </main>
            <Footer />

            {isLangModalOpen && <LanguageModal />}
        </div>
    );
}

export default function App() {
    useEffect(() => {
        try {
            const all = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                all[key] = localStorage.getItem(key);
            }
            console.log("localStorage:", all);
        } catch (e) {
            console.warn("Could not read localStorage:", e);
        }
    }, []);

    return (
        <I18nProvider>
            <Router>
                <ThemeProvider>
                    <AuthProvider>
                        <ErrorProvider>
                            <AppLayout />
                        </ErrorProvider>
                    </AuthProvider>
                </ThemeProvider>
            </Router>
        </I18nProvider>
    );
}