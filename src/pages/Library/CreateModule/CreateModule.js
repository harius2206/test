import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleForm from "./ModuleForm";
import { createModule, updateModule, getModuleById, addModuleTag, removeModuleTag } from "../../../api/modulesApi";
import { addModuleToFolder } from "../../../api/foldersApi";
import Loader from "../../../components/loader/loader";
import { useI18n } from "../../../i18n";
import { useError } from "../../../context/ErrorContext";

export default function CreateModule() {
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();
    const { showError } = useError();

    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);

    const dataFetchedRef = useRef(false);

    const state = location.state || {};
    const mode = state.mode === "edit" ? "edit" : "create";
    const moduleId = state.moduleId || (state.moduleData ? state.moduleData.id : null);

    const folderId = state.folderId;

    useEffect(() => {
        if (dataFetchedRef.current) return;

        if (mode === "create") {
            setInitialData({
                tags: [],
                cards: [{ id: Date.now(), term: "", definition: "" }]
            });
            dataFetchedRef.current = true;
            return;
        }

        if (mode === "edit" && moduleId) {
            dataFetchedRef.current = true;
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
                    showError(t("cmErrorLoadingModule"));
                    navigate("/library");
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [mode, moduleId, navigate, t, showError]);

    const handleFormSubmit = async (formData) => {
        setLoading(true);

        const processedCards = (formData.cards || []).map(c => {
            const cardData = {
                original: c.term,
                translation: c.definition
            };
            if (c.id && c.id < 1700000000000) {
                cardData.id = c.id;
            }
            return cardData;
        });

        const payload = {
            name: formData.name,
            description: formData.description,
            topic: formData.topic?.id || null,
            lang_from: formData.globalLangLeft?.id || 1,
            lang_to: formData.globalLangRight?.id || 2,
            cards: processedCards
        };

        try {
            let currentId = moduleId;
            if (mode === "edit") {
                await updateModule(moduleId, payload);
            } else {
                const response = await createModule(payload);
                currentId = response.data.id;
            }

            if (currentId && formData.tags !== undefined) {
                const oldTags = mode === "edit" ? (initialData?.tags || []) : [];
                const newTags = formData.tags || [];

                const tagsToAdd = newTags.filter(t => !oldTags.includes(t));
                const tagsToRemove = oldTags.filter(t => !newTags.includes(t));

                try {
                    const addPromises = tagsToAdd.map(t => addModuleTag(currentId, t));
                    const removePromises = tagsToRemove.map(t => removeModuleTag(currentId, t));

                    await Promise.all([...addPromises, ...removePromises]);
                } catch (tagErr) {
                    console.warn("Помилка оновлення тегів, але модуль збережено.", tagErr);
                }
            }

            if (mode === "create" && folderId && currentId) {
                await addModuleToFolder(folderId, currentId);
                navigate(`/library/folders/${folderId}`);
            } else {
                mode === "edit" ? navigate(-1) : navigate("/library");
            }
        } catch (error) {
            console.error("Operation failed:", error);
            showError(error);
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
                onSubmitAndPractice={() => console.log(t("cmPracticeComingSoon"))}
            />
        </>
    );
}