import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Folders from "./Folders/Folders";
import Modules from "./Modules/Modules";
import FolderInfo from "./FolderInfo/FolderInfo";
import "./library.css";

export default function Library() {
    const [activeTab, setActiveTab] = useState("folders");
    const [addFolder, setAddFolder] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <main className="library-main">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <div className="library-header">
                                    <h1>Your library</h1>
                                    {activeTab === "folders" ? (
                                        <button
                                            className="add-btn"
                                            style={{
                                                background: "#6366f1",
                                                color: "#fff",
                                                border: "1px solid #ccc",
                                                height: 40,
                                                minWidth: 140,
                                                borderRadius: 6,
                                                fontWeight: "bold",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setAddFolder(true)}
                                        >
                                            Add folder
                                        </button>
                                    ) : activeTab === "modules" ? (
                                        <button
                                            className="add-btn"
                                            style={{
                                                background: "#6366f1",
                                                color: "#fff",
                                                border: "1px solid #ccc",
                                                height: 40,
                                                minWidth: 140,
                                                borderRadius: 6,
                                                fontWeight: "bold",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => navigate("/library/create-module")}
                                        >
                                            Add module
                                        </button>
                                    ) : (
                                        <div style={{ width: 180, height: 40 }} />
                                    )}
                                </div>
                                <div className="tabs-wrapper">
                                    <div
                                        className={`tab ${activeTab === "modules" ? "active" : ""}`}
                                        onClick={() => setActiveTab("modules")}
                                    >
                                        Modules
                                    </div>
                                    <div
                                        className={`tab ${activeTab === "folders" ? "active" : ""}`}
                                        onClick={() => setActiveTab("folders")}
                                    >
                                        Folders
                                    </div>
                                    <div className="tabs-underline">
                                        <div className={`tabs-indicator ${activeTab}`} />
                                    </div>
                                </div>
                                <div className="library-content">
                                    {activeTab === "folders"
                                        ? <Folders addFolder={addFolder} setAddFolder={setAddFolder} />
                                        : <Modules />}
                                </div>
                            </>
                        }
                    />
                    <Route path="folders/:id" element={<FolderInfo />} />
                </Routes>
            </main>
        </div>
    );
}