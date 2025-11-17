// javascript
import { NavLink, useNavigate } from "react-router-dom";
import "./profileNav.css";
import { useEffect, useState } from "react";
import { getUserData, getUserAvatar, clearAuthData } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../avatar/avatar";

export default function ProfileNav() {
    const { logout, setUser } = useAuth();
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState(() => getUserAvatar() || getUserData()?.avatar || null);
    const [profile, setProfile] = useState(() => getUserData() || { username: "Guest", date_joined: null });

    useEffect(() => {
        const onStorage = () => {
            const storedProfile = getUserData();
            setProfile(storedProfile || { username: "Guest", date_joined: null });
            setAvatar(getUserAvatar() || storedProfile?.avatar || null);
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

    const joinedRaw = profile?.date_joined ?? profile?.created_at ?? null;
    const joined =
        joinedRaw && !isNaN(new Date(joinedRaw).getTime())
            ? new Date(joinedRaw).toLocaleDateString()
            : "—";

    return (
        <div className="profile-nav">
            <div className="profile-info">
                <UserAvatar
                    name={profile?.username || "Guest"}
                    src={avatar || profile?.avatar || undefined}
                    size={160}
                    fontSize={56}
                />

                <h3 className="profile-name">{profile?.username || "Guest"}</h3>
                <p className="profile-date">created: {joined}</p>
            </div>

            <nav className="profile-links">
                <NavLink to="/profile/public-library" className={({ isActive }) => (isActive ? "active" : "")}>
                    Public profile
                </NavLink>
                <NavLink to="/profile/private" className={({ isActive }) => (isActive ? "active" : "")}>
                    Private profile
                </NavLink>
                <NavLink to="/profile/change-photo" className={({ isActive }) => (isActive ? "active" : "")}>
                    Change photo
                </NavLink>
                <NavLink to="/profile/safety" className={({ isActive }) => (isActive ? "active" : "")}>
                    Safety
                </NavLink>
                <NavLink to="/logout" onClick={handleLogout}>
                    Log out
                </NavLink>
                <NavLink to="/profile/delete" className={({ isActive }) => (isActive ? "active" : "")}>
                    Delete account
                </NavLink>
            </nav>
        </div>
    );
}