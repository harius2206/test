import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserDetails } from "../../api/usersApi";

import Folders from "./Folders/Folders";
import Modules from "./Modules/Modules";
import FolderInfo from "./FolderInfo/FolderInfo";
import Button from "../../components/button/button";
import Loader from "../../components/loader/loader"; // Імпорт лоадера
import "./library.css";

export default function Library() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("libraryActiveTab") || "folders";
    });

    const [addFolder, setAddFolder] = useState(false);
    const [libraryData, setLibraryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem("libraryActiveTab", activeTab);
    }, [activeTab]);

    // Завантажуємо дані один раз при вході в бібліотеку
    const fetchLibraryData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await getUserDetails(user.id);
            setLibraryData(res.data);
        } catch (error) {
            console.error("Failed to load library data", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLibraryData();
    }, [fetchLibraryData]);

    // Використовуємо фулскрін лоадер для першого завантаження бібліотеки
    if (loading && !libraryData) {
        return <Loader fullscreen />;
    }

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
                                    <div style={{ display: activeTab === "modules" ? "block" : "none" }}>
                                        <Modules
                                            preloadedModules={libraryData?.modules || []}
                                            loadingParent={loading}
                                            onRefresh={fetchLibraryData}
                                        />
                                    </div>

                                    <div style={{ display: activeTab === "folders" ? "block" : "none" }}>
                                        <Folders
                                            addFolder={addFolder}
                                            setAddFolder={setAddFolder}
                                            preloadedFolders={libraryData?.folders || []}
                                            loadingParent={loading}
                                            onRefresh={fetchLibraryData}
                                        />
                                    </div>
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