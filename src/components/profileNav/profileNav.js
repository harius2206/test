import { NavLink, useNavigate } from "react-router-dom";
import "./profileNav.css";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { getUserData, getUserAvatar } from "../../utils/storage";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../avatar/avatar";
import { clearAllExceptTheme } from "../../utils/storage";

export default function ProfileNav() {
    const { logout, setUser } = useAuth();
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState(() => getUserAvatar() || getUserData()?.avatar || null);
    const [profile, setProfile] = useState(() => getUserData() || { username: "Guest", date_joined: null, id: null });

    const [cutName, setCutName] = useState("");
    const nameRef = useRef(null);
    const retryRef = useRef(0);

    useEffect(() => {
        const onStorage = () => {
            const storedProfile = getUserData();
            setProfile(storedProfile || { username: "Guest", date_joined: null, id: null });
            setAvatar(getUserAvatar() || storedProfile?.avatar || null);
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    /* === FIT USERNAME TO WIDTH === */
    const fitName = () => {
        const el = nameRef.current;
        if (!el || !profile?.username) return;

        const containerWidth = el.offsetWidth;
        if (containerWidth === 0 && retryRef.current < 5) {
            retryRef.current += 1;
            requestAnimationFrame(fitName);
            return;
        }
        retryRef.current = 0;

        const availableWidth = containerWidth - 20;
        if (availableWidth <= 0) {
            setCutName("…");
            return;
        }

        const tester = document.createElement("span");
        tester.style.visibility = "hidden";
        tester.style.whiteSpace = "nowrap";
        tester.style.position = "absolute";
        tester.style.fontSize = window.getComputedStyle(el).fontSize;
        tester.style.fontFamily = window.getComputedStyle(el).fontFamily;
        tester.style.fontWeight = window.getComputedStyle(el).fontWeight;
        document.body.appendChild(tester);

        const text = profile.username;

        let trimmedLength = Math.max(1, text.length - 8);
        let trimmed = text.slice(0, trimmedLength);

        tester.textContent = trimmed + "…";
        while (trimmedLength < text.length) {
            const nextLength = trimmedLength + 1;
            const nextText = text.slice(0, nextLength) + "…";
            tester.textContent = nextText;

            if (tester.offsetWidth > availableWidth) {
                break;
            }
            trimmedLength = nextLength;
            trimmed = text.slice(0, trimmedLength);
        }

        const finalText = trimmedLength >= text.length ? text : trimmed + "…";

        setCutName(finalText);
        document.body.removeChild(tester);
    };

    useLayoutEffect(() => {
        fitName();
        requestAnimationFrame(fitName);
    }, [profile]);

    useEffect(() => {
        const onResize = () => {
            fitName();
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [profile]);

    const handleLogout = () => {
        logout?.();
        clearAllExceptTheme();
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

                <h3 className="profile-name" ref={nameRef}>
                    {cutName || profile?.username || "Guest"}
                </h3>

                <p className="profile-date">created: {joined}</p>
            </div>

            <nav className="profile-links">
                {/* Змінено посилання на реальний публічний профіль з використанням ID користувача */}
                <NavLink
                    to={profile?.id ? `/profile/public/${profile.id}` : "/profile/public-library"}
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
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