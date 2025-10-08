import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import ProfileNav from "../../components/profileNav/profileNav";
import profileRoutes from "../../routes/profileRoutes";

export default function Profile() {
    return (
        <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>


            <div style={{ flex: 1, display: "flex" }}>
                <ProfileNav />
                <Routes>
                    {profileRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={<route.component />} />
                    ))}
                    <Route path="*" element={<Navigate to="private" replace />} />
                </Routes>
            </div>

        </div>
    );
}