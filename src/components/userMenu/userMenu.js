import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./userMenu.css";
import { ReactComponent as GlobeIcon } from "../../images/language.svg";
import ClickOutsideWrapper from "../clickOutsideWrapper";
import { ThemeContext } from "../../context/ThemeContext";
import SearchField from "../searchField/searchField";
import UserAvatar from "../avatar/avatar";
import { useAuth } from "../../context/AuthContext";
import { getUserData, clearAllExceptTheme } from "../../utils/storage";
import { useI18n } from "../../i18n";

export default function UserMenu() {
    const { t } = useI18n();
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

    const toggleMenu = () => setOpen((p) => !p);

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
        setTimeout(() => window.location.reload(), 0);
    };

    const handleNavigate = (path, state = null) => {
        navigate(path, { state });
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
                        name={user?.username || t("umGuest_label")}
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
                                    placeholder={t("umSearch_placeholder")}
                                    width="100%"
                                    height="38px"
                                />
                            </div>
                        )}

                        <div className="um-info">
                            <UserAvatar
                                key={avatarVersion}
                                name={user?.username || t("umGuest_label")}
                                src={user?.avatar || getUserData()?.avatar || undefined}
                                size={48}
                                fontSize={24}
                            />
                            <div>
                                <div className="um-name" ref={nameRef}>
                                    {cutName || user?.username || t("umGuest_label")}
                                </div>
                                <div className="um-email">{user?.email || t("umNotLoggedIn_label")}</div>
                            </div>
                        </div>

                        <hr />

                        <nav className="um-links">
                            {user ? (
                                <>
                                    {isMobile && (
                                        <>
                                            <div className="um-link" onClick={() => handleNavigate("/")}>{t("umMain_label")}</div>
                                            <div className="um-link" onClick={() => handleNavigate("/library")}>{t("umLibrary_label")}</div>
                                            <div className="um-link" onClick={() => handleNavigate("/folders")}>{t("umFolders_label")}</div>
                                            <hr />
                                        </>
                                    )}

                                    <div className="um-link" onClick={() => handleNavigate("/profile/private")}>{t("umPrivateProfile_label")}</div>
                                    <div className="um-link" onClick={() => handleNavigate(`/profile/public/${user?.id}`)}>{t("umPublicProfile_label")}</div>

                                    <hr />

                                    <div className="um-link um-row">
                                        <span>{t("umLanguage_label")}</span>
                                        <span className="um-lang">{t("umEnglish_label")} <GlobeIcon className="um-lang-icon" /></span>
                                    </div>

                                    <div className="um-theme-selector">
                                        <span className="um-theme-label">{t("umSelectTheme_label")}</span>
                                        <div className="um-theme-buttons">
                                            <button
                                                className={`um-theme-button black ${theme === "dark" ? "active" : ""}`}
                                                onClick={() => handleThemeChange("dark")}
                                                aria-label={t("umDarkTheme_label")}
                                            />
                                            <button
                                                className={`um-theme-button white ${theme === "light" ? "active" : ""}`}
                                                onClick={() => handleThemeChange("light")}
                                                aria-label={t("umLightTheme_label")}
                                            />
                                        </div>
                                    </div>

                                    <hr />

                                    {!isSavesPage && (
                                        <>
                                            <div className="um-link" onClick={() => handleNavigate("/library/create-module")}>{t("umCreateModule_label")}</div>
                                            <hr />
                                        </>
                                    )}

                                    {user?.is_staff && (
                                        <>
                                            <div className="um-link" onClick={() => window.open("http://127.0.0.1:8000/swagger/#/api/api_v1_auth_login_create", "_blank")}>{t("umSwagger_label")}</div>
                                            <div className="um-link" onClick={() => window.open("http://127.0.0.1:8000/admin/users/user/", "_blank")}>{t("umAdmin_label")}</div>
                                            <div className="um-link" onClick={() => window.open("http://127.0.0.1:8000/silk/request/d069e388-28ca-4f61-94f9-2e54f423690b/", "_blank")}>{t("umSilk_label")}</div>
                                            <div className="um-link" onClick={() => window.open("http://127.0.0.1:5555/tasks", "_blank")}>{t("umFlower_label")}</div>
                                            <hr />
                                        </>
                                    )}

                                    <div className="um-link um-logout" onClick={handleLogout}>{t("umLogout_label")}</div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="um-link"
                                        style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
                                        onClick={() => handleNavigate("/login")}
                                    >
                                        {t("umLogin_label")}
                                    </div>

                                    <hr />

                                    <div className="um-link um-row">
                                        <span>{t("umLanguage_label")}</span>
                                        <span className="um-lang">{t("umEnglish_label")} <GlobeIcon className="um-lang-icon" /></span>
                                    </div>

                                    <div className="um-theme-selector">
                                        <span className="um-theme-label">{t("umSelectTheme_label")}</span>
                                        <div className="um-theme-buttons">
                                            <button
                                                className={`um-theme-button black ${theme === "dark" ? "active" : ""}`}
                                                onClick={() => handleThemeChange("dark")}
                                                aria-label={t("umDarkTheme_label")}
                                            />
                                            <button
                                                className={`um-theme-button white ${theme === "light" ? "active" : ""}`}
                                                onClick={() => handleThemeChange("light")}
                                                aria-label={t("umLightTheme_label")}
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
