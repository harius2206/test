import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import appRoutes from "./routes/appRoutes";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";

function App() {
    return (
        <Router>
            <div className="page-wrapper">
                <Header />
                <main className="content">
                    <Routes>
                        {appRoutes.map(({ path, component: Component }) => (
                            <Route key={path} path={path} element={<Component />} />
                        ))}
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
