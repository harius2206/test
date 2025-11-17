// File: src/components/userMenu/userMenu.js
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./userMenu.css";
import { ReactComponent as GlobeIcon } from "../../images/language.svg";
import ClickOutsideWrapper from "../clickOutsideWrapper";
import { ThemeContext } from "../../context/ThemeContext";
import SearchField from "../searchField/searchField";
import UserAvatar from "../avatar/avatar";
import { useAuth } from "../../context/AuthContext";
import { getUserData, saveUserData } from "../../utils/storage";

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

    /* ==== UPDATE USER WHEN MENU OPENS ==== */
    const toggleMenu = () => {
        const storedUser = getUserData();
        if (storedUser) setUser(storedUser);
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
        logout();
        setOpen(false);
        navigate("/");
    };

    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

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
                                <div className="um-name">{user?.username || "Guest"}</div>
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
