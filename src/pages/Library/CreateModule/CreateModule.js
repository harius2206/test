import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleForm from "./ModuleForm";
import { createModule, updateModule, getModuleById } from "../../../api/modulesApi";

export default function CreateModule() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);

    const state = location.state || {};
    const mode = state.mode === "edit" ? "edit" : "create";
    const moduleId = state.moduleId || (state.moduleData ? state.moduleData.id : null);

    // Завантаження даних при редагуванні
    useEffect(() => {
        if (mode === "create") {
            // Для створення не передаємо нічого специфічного, ModuleForm сам підтягне мови
            setInitialData({});
            return;
        }

        if (mode === "edit" && moduleId) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await getModuleById(moduleId);
                    const backendModule = response.data;

                    // Форматуємо дані під ModuleForm
                    const formattedData = {
                        id: backendModule.id,
                        name: backendModule.name,
                        description: backendModule.description,
                        topic: typeof backendModule.topic === 'object' ? backendModule.topic.name : (backendModule.topic || ""),
                        tags: backendModule.tags || [],

                        // Передаємо мови як є (об'єкти або ID), ModuleForm сам їх знайде в списку
                        globalLangLeft: backendModule.lang_from,
                        globalLangRight: backendModule.lang_to,

                        cards: backendModule.cards && backendModule.cards.length > 0
                            ? backendModule.cards.map(c => ({
                                id: c.id,
                                term: c.original,
                                definition: c.translation
                            }))
                            : [{ id: Date.now(), term: "", definition: "" }]
                    };

                    setInitialData(formattedData);
                } catch (error) {
                    console.error("Failed to load module details:", error);
                    alert("Error loading module data. Please try again.");
                    navigate("/library");
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [mode, moduleId, navigate]);

    const handleFormSubmit = async (formData) => {
        setLoading(true);

        const payload = {
            name: formData.name,
            description: formData.description,
            topic: formData.topic?.id || null,
            tags: formData.tags,
            lang_from: formData.globalLangLeft?.id || 1,
            lang_to: formData.globalLangRight?.id || 2,
            cards: formData.cards.map(c => ({
                original: c.term,
                translation: c.definition
            }))
        };

        try {
            if (mode === "edit") {
                await updateModule(moduleId, payload);
            } else {
                await createModule(payload);
            }
            navigate("/library");
        } catch (error) {
            console.error("Operation failed:", error);
            const msg = error.response?.data
                ? JSON.stringify(error.response.data)
                : "Failed to save module.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !initialData && mode === "edit") return <div style={{padding: 40, textAlign: 'center'}}>Loading...</div>;

    return (
        <ModuleForm
            mode={mode}
            initialData={initialData}
            loading={loading}
            onSubmit={handleFormSubmit}
            onSubmitAndPractice={() => console.log("Practice feature coming soon")}
        />
    );
}