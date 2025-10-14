import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./userMenu.css";
import userImage from "../header/userImage.jpg";
import { ReactComponent as GlobeIcon } from "../../images/language.svg";
import ClickOutsideWrapper from "../clickOutsideWrapper";
import { ThemeContext } from "../../context/ThemeContext";
import SearchField from "../searchField/searchField";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { theme, setLight, setDark } = useContext(ThemeContext);

    const toggleMenu = () => setOpen(prev => !prev);
    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };
    const handleThemeChange = (mode) => {
        mode === "light" ? setLight() : setDark();
    };

    const isMobile = window.innerWidth <= 768;
    const showSearchInsideMenu = window.innerWidth <= 570;

    return (
        <ClickOutsideWrapper onClickOutside={() => setOpen(false)}>
            <div className="um-wrapper">
                <img
                    src={userImage}
                    alt="user"
                    className="um-avatar"
                    onClick={toggleMenu}
                />

                {open && (
                    <div className={`um-menu ${showSearchInsideMenu ? "mobile-full" : ""}`}>
                        {showSearchInsideMenu && (
                            <div className="um-search-container">
                                <SearchField placeholder="search for anything" width="100%" height="38px" />
                            </div>
                        )}

                        <div className="um-info">
                            <img src={userImage} alt="user" className="um-avatar-small" />
                            <div>
                                <div className="um-name">admin</div>
                                <div className="um-email">admin@gmail.com</div>
                            </div>
                        </div>

                        <hr />

                        <nav className="um-links">
                            {isMobile && (
                                <>
                                    <div className="um-link" onClick={() => handleNavigate("/")}>Main</div>
                                    <div className="um-link" onClick={() => handleNavigate("/library")}>Library</div>
                                    <div className="um-link" onClick={() => handleNavigate("/folders")}>Folders</div>
                                    <hr />
                                </>
                            )}

                            <div className="um-link" onClick={() => handleNavigate("/profile/private")}>
                                Private profile
                            </div>
                            <div className="um-link" onClick={() => handleNavigate("/profile/public-library")}>
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
                                        className={`um-theme-button black ${theme === "dark" ? "active" : ""}`}
                                        onClick={() => handleThemeChange("dark")}
                                        aria-label="Dark theme"
                                    ></button>
                                    <button
                                        className={`um-theme-button white ${theme === "light" ? "active" : ""}`}
                                        onClick={() => handleThemeChange("light")}
                                        aria-label="Light theme"
                                    ></button>
                                </div>
                            </div>

                            <hr />

                            <div className="um-link" onClick={() => handleNavigate("/library/create-module")}>
                                Create module
                            </div>
                            <div className="um-link" onClick={() => handleNavigate("/library/create-folder")}>
                                Create folder
                            </div>

                            <hr />

                            <div className="um-link um-logout" onClick={() => handleNavigate("/")}>
                                Log out
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </ClickOutsideWrapper>
    );
}
