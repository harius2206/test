import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserDetails } from "../../api/usersApi";
import { useI18n } from "../../i18n";

import Folders from "./Folders/Folders";
import Modules from "./Modules/Modules";
import FolderInfo from "./FolderInfo/FolderInfo";
import Button from "../../components/button/button";
import Loader from "../../components/loader/loader";
import "./library.css";

export default function Library() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [lActiveTab, lSetActiveTab] = useState(() => {
        return localStorage.getItem("libraryActiveTab") || "folders";
    });

    const [lAddFolder, lSetAddFolder] = useState(false);
    const [lLibraryData, lSetLibraryData] = useState(null);
    const [lLoading, lSetLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem("libraryActiveTab", lActiveTab);
    }, [lActiveTab]);

    const lFetchLibraryData = useCallback(async () => {
        if (!user?.id) return;
        lSetLoading(true);
        try {
            const res = await getUserDetails(user.id);
            lSetLibraryData(res.data);
        } catch (error) {
            console.error("Failed to load library data", error);
        } finally {
            lSetLoading(false);
        }
    }, [user]);

    useEffect(() => {
        lFetchLibraryData();
    }, [lFetchLibraryData]);

    if (lLoading && !lLibraryData) {
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
                                    <h1>{t("lLibraryTitle")}</h1>
                                    {lActiveTab === "folders" ? (
                                        <Button variant="static" width={170} height={40} onClick={() => lSetAddFolder(true)}>
                                            {t("lAddFolder")}
                                        </Button>
                                    ) : (
                                        <Button variant="static" width={170} height={40} onClick={() => navigate("/library/create-module")}>
                                            {t("lAddModule")}
                                        </Button>
                                    )}
                                </div>

                                <div className="tabs-wrapper">
                                    <div
                                        className={`tab ${lActiveTab === "modules" ? "active" : ""}`}
                                        onClick={() => lSetActiveTab("modules")}
                                    >
                                        {t("lTabModules")}
                                    </div>
                                    <div
                                        className={`tab ${lActiveTab === "folders" ? "active" : ""}`}
                                        onClick={() => lSetActiveTab("folders")}
                                    >
                                        {t("lTabFolders")}
                                    </div>
                                    <div className="tabs-underline">
                                        <div className={`tabs-indicator ${lActiveTab}`} />
                                    </div>
                                </div>

                                <div className="library-content">
                                    <div style={{ display: lActiveTab === "modules" ? "block" : "none" }}>
                                        <Modules
                                            preloadedModules={lLibraryData?.modules || []}
                                            loadingParent={lLoading}
                                            onRefresh={lFetchLibraryData}
                                        />
                                    </div>

                                    <div style={{ display: lActiveTab === "folders" ? "block" : "none" }}>
                                        <Folders
                                            addFolder={lAddFolder}
                                            setAddFolder={lSetAddFolder}
                                            preloadedFolders={lLibraryData?.folders || []}
                                            loadingParent={lLoading}
                                            onRefresh={lFetchLibraryData}
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