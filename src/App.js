import ThemeProvider from "./context/ThemeContext";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import appRoutes from "./routes/appRoutes";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import SidePanel from "./components/sidePanel/sidePanel";

function AppLayout() {
    const location = useLocation();
    const hideSide = location.pathname.startsWith("/profile");

    return (
        <div className="page-wrapper">
            <Header />
            <main className="content">
                {!hideSide && <SidePanel isLeftAligned={true} />}
                <div className="main-content">
                    <Routes>
                        {appRoutes.map(({ path, component: Component }) => (
                            <Route key={path} path={path} element={<Component />} />
                        ))}
                    </Routes>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppLayout />
            </Router>
        </ThemeProvider>
    );
}