import { NavLink, useNavigate } from "react-router-dom";
import "./profileNav.css";
import UserAvatar from "../avatar/avatar";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserData, getUserAvatar, clearAuthData } from "../../utils/storage";

export default function ProfileNav() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(getUserAvatar());
    const [profile, setProfile] = useState(user || getUserData());

    useEffect(() => {
        // оновлюємо при зміні localStorage
        const onStorage = () => {
            setProfile(getUserData());
            setAvatar(getUserAvatar());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const handleLogout = () => {
        logout?.();
        clearAuthData();
        setUser?.(null);
        navigate("/");
    };

    return (
        <div className="profile-nav">
            <div className="profile-info">
                <UserAvatar
                    name={profile?.username || "Guest"}
                    src={avatar || undefined}
                    size={160}
                    fontSize={64}
                />
                <h3 className="profile-name">{profile?.username || "Guest"}</h3>
                <p className="profile-date">
                    created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                </p>
            </div>

            <nav className="profile-links">
                <NavLink
                    to="/profile/public-library"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Public profile
                </NavLink>

                <NavLink
                    to="/profile/private"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Private profile
                </NavLink>

                <NavLink
                    to="/profile/change-photo"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Change photo
                </NavLink>

                <NavLink
                    to="/profile/safety"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Safety
                </NavLink>

                <NavLink to="/logout" activeClassName="active">
                    Log out
                </NavLink>
                
                <NavLink
                    to="/profile/delete"
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    Delete account
                </NavLink>
            </nav>
        </div>
    );
}
