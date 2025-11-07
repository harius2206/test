import { NavLink } from "react-router-dom";
import "./profileNav.css";
import UserAvatar from "../avatar/avatar";

export default function ProfileNav() {
    return (
        <div className="profile-nav">
            <div className="profile-info">
                <UserAvatar
                    name="admin"
                    size={160}      /* target size (CSS will clamp/override via variables) */
                    fontSize={64}   /* fallback font size */
                />
                <h3 className="profile-name">admin</h3>
                <p className="profile-date">created: 15.05.2030</p>
            </div>

            <nav className="profile-links">
                <NavLink to="/profile/public-library" activeClassName="active">
                    Public profile
                </NavLink>

                <NavLink to="/profile/private" activeClassName="active">
                    Private profile
                </NavLink>

                <NavLink to="/profile/change-photo" activeClassName="active">
                    Change photo
                </NavLink>

                <NavLink to="/profile/safety" activeClassName="active">
                    Safety
                </NavLink>

                <NavLink to="/logout" activeClassName="active">
                    Log out
                </NavLink>

                <NavLink to="/profile/delete" activeClassName="active">
                    Delete account
                </NavLink>
            </nav>
        </div>
    );
}
