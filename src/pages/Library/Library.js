import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Folders from "./Folders/Folders";
import Modules from "./Modules/Modules";
import FolderInfo from "./FolderInfo/FolderInfo";
import Button from "../../components/button/button";
import "./library.css";

export default function Library() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("libraryActiveTab") || "folders";
    });
    const [addFolder, setAddFolder] = useState(false);

    useEffect(() => {
        localStorage.setItem("libraryActiveTab", activeTab);
    }, [activeTab]);

    return (
        <div className="app-wrapper">
            <main className="library-main">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <div className="library-header">
                                    <h1>Your library</h1>
                                    {activeTab === "folders" ? (
                                        <Button variant="static" width={170} height={40} onClick={() => setAddFolder(true)}>
                                            Add folder
                                        </Button>
                                    ) : (
                                        <Button variant="static" width={170} height={40} onClick={() => navigate("/library/create-module")}>
                                            Add module
                                        </Button>
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
                                    {activeTab === "folders" ? (
                                        <Folders addFolder={addFolder} setAddFolder={setAddFolder} />
                                    ) : (
                                        <Modules />
                                    )}
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