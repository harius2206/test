import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./userMenu.css";
import { ReactComponent as GlobeIcon } from "../../images/language.svg";
import ClickOutsideWrapper from "../clickOutsideWrapper";
import { ThemeContext } from "../../context/ThemeContext";
import SearchField from "../searchField/searchField";
import UserAvatar from "../avatar/avatar";
import { useAuth } from "../../context/AuthContext";
import { getUserData, saveUserData } from "../../utils/storage";
import { clearAllExceptTheme } from "../../utils/storage";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const [avatarVersion, setAvatarVersion] = useState(0);
    const { user, logout, setUser } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setLight, setDark } = useContext(ThemeContext);

    const handleThemeChange = (mode) =>
        mode === "light" ? setLight() : setDark();

    const isMobile = window.innerWidth <= 768;
    const showSearchInsideMenu = window.innerWidth <= 570;
    const isSavesPage =
        location.pathname.includes("/saves") ||
        location.pathname.includes("/library/saves");

    /* ==== FIX: Прибрано зайвий виклик setUser ==== */
    const toggleMenu = () => {
        // Ми просто відкриваємо/закриваємо меню.
        // Не потрібно оновлювати глобальний контекст тут, це викликає ре-рендер сторінок.
        setOpen((p) => !p);
    };

    /* ==== LISTEN STORAGE CHANGES ==== */
    useEffect(() => {
        const update = () => {
            const storedUser = getUserData();
            setUser(storedUser);
            setAvatarVersion((v) => v + 1);
        };
        window.addEventListener("storage", update);
        return () => window.removeEventListener("storage", update);
    }, [setUser]);

    const handleLogout = () => {
        logout?.();
        clearAllExceptTheme();
        setUser?.(null);
        window.dispatchEvent(new Event("storage"));
        navigate("/");
        setTimeout(() => {
            window.location.reload();
        }, 0);
    };

    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

    const [cutName, setCutName] = useState("");
    const nameRef = useRef(null);

    const fitName = () => {
        const el = nameRef.current;
        if (!el || !user?.username) return;

        const containerWidth = el.offsetWidth;
        const tester = document.createElement("span");

        tester.style.visibility = "hidden";
        tester.style.whiteSpace = "nowrap";
        tester.style.fontSize = window.getComputedStyle(el).fontSize;
        tester.style.fontFamily = window.getComputedStyle(el).fontFamily;

        document.body.appendChild(tester);

        let text = user.username;
        tester.textContent = text;

        if (tester.offsetWidth <= containerWidth) {
            setCutName(text);
            document.body.removeChild(tester);
            return;
        }

        let trimmed = text;
        while (tester.offsetWidth > containerWidth && trimmed.length > 0) {
            trimmed = trimmed.slice(0, -1);
            tester.textContent = trimmed + "…";
        }

        setCutName(trimmed + "…");
        document.body.removeChild(tester);
    };

    useEffect(() => {
        if (open) fitName();
    }, [open, user]);

    useEffect(() => {
        window.addEventListener("resize", fitName);
        return () => window.removeEventListener("resize", fitName);
    }, []);

    return (
        <ClickOutsideWrapper onClickOutside={() => setOpen(false)}>
            <div className="um-wrapper">
                <div className="um-avatar-btn" onClick={toggleMenu}>
                    <UserAvatar
                        key={avatarVersion}
                        name={user?.username || "Guest"}
                        src={user?.avatar || getUserData()?.avatar || undefined}
                        size={40}
                        fontSize={20}
                    />
                </div>

                {open && (
                    <div className={`um-menu ${showSearchInsideMenu ? "mobile-full" : ""}`}>
                        {showSearchInsideMenu && (
                            <div className="um-search-container">
                                <SearchField
                                    placeholder="search for anything"
                                    width="100%"
                                    height="38px"
                                />
                            </div>
                        )}

                        <div className="um-info">
                            <UserAvatar
                                key={avatarVersion}
                                name={user?.username || "Guest"}
                                src={user?.avatar || getUserData()?.avatar || undefined}
                                size={48}
                                fontSize={24}
                            />
                            <div>
                                <div className="um-name" ref={nameRef}>
                                    {cutName || user?.username || "Guest"}
                                </div>
                                <div className="um-email">{user?.email || "not logged in"}</div>
                            </div>
                        </div>

                        <hr />

                        <nav className="um-links">
                            {user ? (
                                <>
                                    {isMobile && (
                                        <>
                                            <div
                                                className="um-link"
                                                onClick={() => handleNavigate("/")}
                                            >
                                                Main
                                            </div>
                                            <div
                                                className="um-link"
                                                onClick={() => handleNavigate("/library")}
                                            >
                                                Library
                                            </div>
                                            <div
                                                className="um-link"
                                                onClick={() => handleNavigate("/folders")}
                                            >
                                                Folders
                                            </div>
                                            <hr />
                                        </>
                                    )}

                                    <div
                                        className="um-link"
                                        onClick={() => handleNavigate("/profile/private")}
                                    >
                                        Private profile
                                    </div>
                                    <div
                                        className="um-link"
                                        onClick={() => handleNavigate("/profile/public-library")}
                                    >
                                        Public profile
                                    </div>

                                    <hr />

                                    <div className="um-link um-row">
                                        <span>Language</span>
                                        <span className="um-lang">
                                            English <GlobeIcon className="um-lang-icon" />
                                        </span>
                                    </div>

                                    <div className="um-theme-selector">
                                        <span className="um-theme-label">Select theme</span>
                                        <div className="um-theme-buttons">
                                            <button
                                                className={`um-theme-button black ${
                                                    theme === "dark" ? "active" : ""
                                                }`}
                                                onClick={() => handleThemeChange("dark")}
                                                aria-label="Dark theme"
                                            />
                                            <button
                                                className={`um-theme-button white ${
                                                    theme === "light" ? "active" : ""
                                                }`}
                                                onClick={() => handleThemeChange("light")}
                                                aria-label="Light theme"
                                            />
                                        </div>
                                    </div>

                                    <hr />

                                    {!isSavesPage && (
                                        <>
                                            <div
                                                className="um-link"
                                                onClick={() => handleNavigate("/library/create-module")}
                                            >
                                                Create module
                                            </div>
                                            <div
                                                className="um-link"
                                                onClick={() => handleNavigate("/library/create-folder")}
                                            >
                                                Create folder
                                            </div>
                                            <hr />
                                        </>
                                    )}

                                    {/* Staff Links */}
                                    {user?.is_staff && (
                                        <>
                                            <div
                                                className="um-link"
                                                onClick={() => window.open("http://127.0.0.1:8000/swagger/#/api/api_v1_auth_login_create", "_blank")}
                                            >
                                                Swagger
                                            </div>
                                            <div
                                                className="um-link"
                                                onClick={() => window.open("http://127.0.0.1:8000/admin/users/user/", "_blank")}
                                            >
                                                Admin
                                            </div>
                                            <div
                                                className="um-link"
                                                onClick={() => window.open("http://127.0.0.1:8000/silk/request/d069e388-28ca-4f61-94f9-2e54f423690b/", "_blank")}
                                            >
                                                Silk
                                            </div>
                                            <div
                                                className="um-link"
                                                onClick={() => window.open("http://127.0.0.1:5555/tasks", "_blank")}
                                            >
                                                Flower
                                            </div>
                                            <hr />
                                        </>
                                    )}

                                    <div className="um-link um-logout" onClick={handleLogout}>
                                        Log out
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="um-link"
                                        style={{
                                            color: "var(--accent)",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => handleNavigate("/login")}
                                    >
                                        Log in
                                    </div>

                                    <hr />

                                    <div className="um-link um-row">
                                        <span>Language</span>
                                        <span className="um-lang">
                                            English <GlobeIcon className="um-lang-icon" />
                                        </span>
                                    </div>

                                    <div className="um-theme-selector">
                                        <span className="um-theme-label">Select theme</span>
                                        <div className="um-theme-buttons">
                                            <button
                                                className={`um-theme-button black ${
                                                    theme === "dark" ? "active" : ""
                                                }`}
                                                onClick={() => handleThemeChange("dark")}
                                                aria-label="Dark theme"
                                            />
                                            <button
                                                className={`um-theme-button white ${
                                                    theme === "light" ? "active" : ""
                                                }`}
                                                onClick={() => handleThemeChange("light")}
                                                aria-label="Light theme"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </ClickOutsideWrapper>
    );
}