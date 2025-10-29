// JavaScript
import { useState, useEffect } from "react";
import Folders from "../Folders/Folders";
import Modules from "../Modules/Modules";
import Cards from "./Cards/Cards";
import "./saves.css";

export default function Saves() {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("savesActiveTab") || "folders");

    useEffect(() => {
        localStorage.setItem("savesActiveTab", activeTab);
    }, [activeTab]);

    return (
        <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <main className="library-main">
                <div className="library-header">
                    <h1>Your saves</h1>
                    {activeTab === "folders" ? (
                        <button className="add-btn" onClick={() => {}}>Add folder</button>
                    ) : activeTab === "modules" ? (
                        <button className="add-btn" onClick={() => {}}>Add module</button>
                    ) : (
                        <button className="add-btn" onClick={() => {}}>Add card</button>
                    )}
                </div>

                <div className="tabs-wrapper">
                    <div className={`tab ${activeTab === "modules" ? "active" : ""}`} onClick={() => setActiveTab("modules")}>
                        Modules
                    </div>
                    <div className={`tab ${activeTab === "folders" ? "active" : ""}`} onClick={() => setActiveTab("folders")}>
                        Folders
                    </div>
                    <div className={`tab ${activeTab === "cards" ? "active" : ""}`} onClick={() => setActiveTab("cards")}>
                        Cards
                    </div>
                    <div className="tabs-underline">
                        <div className={`tabs-indicator ${activeTab}`} />
                    </div>
                </div>

                <div className="library-content">
                    {activeTab === "folders" && <Folders source="saves" />}
                    {activeTab === "modules" && <Modules source="saves" />}
                    {activeTab === "cards" && <Cards />}
                </div>
            </main>
        </div>
    );
}