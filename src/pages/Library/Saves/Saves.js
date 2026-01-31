import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getUserDetails } from "../../../api/usersApi";
import Folders from "../Folders/Folders";
import Modules from "../Modules/Modules";
import Cards from "./Cards/Cards";
import Loader from "../../../components/loader/loader";
import "./saves.css";

export default function Saves() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("savesActiveTab") || "folders");

    // Стейт для завантаження папок користувача (щоб працювало "Add to folder" в модулях)
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem("savesActiveTab", activeTab);
    }, [activeTab]);

    const loadUserData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await getUserDetails(user.id);
            setUserData(res.data);
        } catch (error) {
            console.error("Failed to load user folders for saves page", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    return (
        <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <main className="library-main">
                <div className="library-header">
                    <h1>Your saves</h1>
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
                    <div
                        className={`tab ${activeTab === "cards" ? "active" : ""}`}
                        onClick={() => setActiveTab("cards")}
                    >
                        Cards
                    </div>
                    <div className="tabs-underline">
                        <div className={`tabs-indicator ${activeTab}`} />
                    </div>
                </div>

                <div className="library-content">
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {activeTab === "folders" && (
                                <Folders
                                    source="saves"
                                    onRefresh={loadUserData}
                                />
                            )}

                            {activeTab === "modules" && (
                                <Modules
                                    source="saves"
                                    preloadedFolders={userData?.folders || []}
                                    onRefresh={loadUserData}
                                />
                            )}

                            {activeTab === "cards" && (
                                <Cards />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}