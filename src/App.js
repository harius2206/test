import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import appRoutes from "./routes/appRoutes";

function App() {
    return (
        <Router>
            <Routes>
                {appRoutes.map(({ path, component: Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}
            </Routes>
        </Router>
    );
}

export default App;