import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleForm from "./ModuleForm";
import { createModule, updateModule, getModuleById } from "../../../api/modulesApi";
import { addModuleToFolder } from "../../../api/foldersApi";
import Loader from "../../../components/loader/loader";

export default function CreateModule() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);

    const state = location.state || {};
    const mode = state.mode === "edit" ? "edit" : "create";
    const moduleId = state.moduleId || (state.moduleData ? state.moduleData.id : null);

    const folderId = state.folderId;

    useEffect(() => {
        if (mode === "create") {
            setInitialData({
                cards: [{ id: Date.now(), term: "", definition: "" }]
            });
            return;
        }

        if (mode === "edit" && moduleId) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await getModuleById(moduleId);
                    const backendModule = response.data;

                    const formattedData = {
                        id: backendModule.id,
                        name: backendModule.name,
                        description: backendModule.description,
                        topic: backendModule.topic,
                        tags: backendModule.tags || [],
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
                    alert("Error loading module data.");
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

        const processedCards = (formData.cards || []).map(c => {
            const cardData = {
                original: c.term,
                translation: c.definition
            };
            // Зберігаємо ID тільки для старих карток (які прийшли з бекенду)
            // Нові картки (додані вручну або імпортовані) матимуть тимчасові великі ID (Date.now()), їх ми не шлемо
            if (c.id && c.id < 1700000000000) {
                cardData.id = c.id;
            }
            return cardData;
        });

        const payload = {
            name: formData.name,
            description: formData.description,
            topic: formData.topic?.id || null,
            tags: formData.tags,
            lang_from: formData.globalLangLeft?.id || 1,
            lang_to: formData.globalLangRight?.id || 2,
            cards: processedCards
        };

        try {
            if (mode === "edit") {
                await updateModule(moduleId, payload);
                navigate(-1);
            } else {
                const response = await createModule(payload);
                const newModuleId = response.data.id;

                if (folderId && newModuleId) {
                    await addModuleToFolder(folderId, newModuleId);
                    navigate(`/library/folders/${folderId}`);
                } else {
                    navigate("/library");
                }
            }
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

    if (loading && !initialData && mode === "edit") {
        return <Loader fullscreen />;
    }

    return (
        <>
            {loading && mode === "create" && <Loader fullscreen />}

            <ModuleForm
                mode={mode}
                initialData={initialData}
                loading={loading}
                onSubmit={handleFormSubmit}
                onSubmitAndPractice={() => console.log("Practice feature coming soon")}
            />
        </>
    );
}