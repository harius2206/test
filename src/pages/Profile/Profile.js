import { Routes, Route, Navigate } from "react-router-dom";

import ProfileNav from "../../components/profileNav/profileNav";
import profileRoutes from "../../routes/profileRoutes";

export default function Profile() {
    return (
        <div className="app-wrapper">
            <div className="app-content">
                <ProfileNav />
                <div className="profile-content-wrapper">
                    <Routes>
                        {profileRoutes.map((route, index) => (
                            <Route key={index} path={route.path} element={<route.component />} />
                        ))}
                        <Route path="*" element={<Navigate to="private" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
