import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getUserDetails } from "../../../api/usersApi";
import { useI18n } from "../../../i18n";
import Folders from "../Folders/Folders";
import Modules from "../Modules/Modules";
import Cards from "./Cards/Cards";
import Loader from "../../../components/loader/loader";
import "./saves.css";

export default function Saves() {
    const { user } = useAuth();
    const { t } = useI18n();

    const [sActiveTab, sSetActiveTab] = useState(() => localStorage.getItem("savesActiveTab") || "folders");

    // Стейт для завантаження папок користувача (щоб працювало "Add to folder" в модулях)
    const [sUserData, sSetUserData] = useState(null);
    const [sLoading, sSetLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem("savesActiveTab", sActiveTab);
    }, [sActiveTab]);

    const sLoadUserData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await getUserDetails(user.id);
            sSetUserData(res.data);
        } catch (error) {
            console.error("Failed to load user folders for saves page", error);
        } finally {
            sSetLoading(false);
        }
    }, [user]);

    useEffect(() => {
        sLoadUserData();
    }, [sLoadUserData]);

    return (
        <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <main className="library-main">
                <div className="library-header">
                    <h1>{t("sSavesTitle")}</h1>
                </div>

                <div className="tabs-wrapper">
                    <div
                        className={`tab ${sActiveTab === "modules" ? "active" : ""}`}
                        onClick={() => sSetActiveTab("modules")}
                    >
                        {t("sTabModules")}
                    </div>
                    <div
                        className={`tab ${sActiveTab === "folders" ? "active" : ""}`}
                        onClick={() => sSetActiveTab("folders")}
                    >
                        {t("sTabFolders")}
                    </div>
                    <div
                        className={`tab ${sActiveTab === "cards" ? "active" : ""}`}
                        onClick={() => sSetActiveTab("cards")}
                    >
                        {t("sTabCards")}
                    </div>
                    <div className="tabs-underline">
                        <div className={`tabs-indicator ${sActiveTab}`} />
                    </div>
                </div>

                <div className="library-content">
                    {sLoading ? (
                        <Loader />
                    ) : (
                        <>
                            {sActiveTab === "folders" && (
                                <Folders
                                    source="saves"
                                    onRefresh={sLoadUserData}
                                />
                            )}

                            {sActiveTab === "modules" && (
                                <Modules
                                    source="saves"
                                    preloadedFolders={sUserData?.folders || []}
                                    onRefresh={sLoadUserData}
                                />
                            )}

                            {sActiveTab === "cards" && (
                                <Cards />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}