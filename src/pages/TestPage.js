import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import ProfileNav from "../components/profileNav/profileNav";
import profileRoutes from "../routes/profileRoutes";
import Button from "../components/button/button";

export default function TestPage() {
    return (
        <Router>
            <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Header />

                <div style={{ flex: 1, display: "flex" }}>
                    <ProfileNav />
                    <Routes>
                        {profileRoutes.map((route, index) => (
                            <Route key={index} path={route.path} element={<route.component />} />
                        ))}
                        <Route path="*" element={<Navigate to="/profile/private" replace />} />
                    </Routes>
                </div>

                <Footer />
            </div>
        </Router>







    );
}