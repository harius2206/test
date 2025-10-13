import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./userMenu.css";
import userImage from "../header/userImage.jpg";
import { ReactComponent as GlobeIcon } from "../../images/language.svg";
import ClickOutsideWrapper from "../clickOutsideWrapper";

export default function UserMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setOpen(prev => !prev);

    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

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
                    <div className="um-menu">
                        <div className="um-info">
                            <img src={userImage} alt="user" className="um-avatar-small" />
                            <div>
                                <div className="um-name">admin</div>
                                <div className="um-email">admin@gmail.com</div>
                            </div>
                        </div>
                        <hr />
                        <nav className="um-links">
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
                                    <button className="um-theme-button black"></button>
                                    <button className="um-theme-button white"></button>
                                </div>
                            </div>

                            <hr />

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
