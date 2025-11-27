import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModuleForm from "./ModuleForm";
import { createModule, updateModule, getModuleById } from "../../../api/modulesApi";

// Хелпери для мапінгу мов (якщо прийшли без ID)
const LANG_MAP = {
    "Polish": 1,
    "English": 2,
    "Ukrainian": 3,
    "German": 4,
    "Spanish": 5
};

const getLangId = (langObj) => langObj?.id || 1;

const getLangName = (langData) => {
    if (!langData) return "Polish";
    if (typeof langData === 'object' && langData.name) return langData.name;
    const foundName = Object.keys(LANG_MAP).find(key => LANG_MAP[key] === langData);
    return foundName || "Polish";
};

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
            setInitialData({
                // Дефолтні значення для створення
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

                    // Форматуємо дані під ModuleForm
                    const formattedData = {
                        id: backendModule.id,
                        name: backendModule.name,
                        description: backendModule.description,
                        topic: typeof backendModule.topic === 'object' ? backendModule.topic : backendModule.topic, // Передаємо як є (об'єкт або null)
                        tags: backendModule.tags || [],

                        // Передаємо об'єкти мов
                        globalLangLeft: backendModule.lang_from,
                        globalLangRight: backendModule.lang_to,

                        // Картки: зберігаємо ID
                        cards: backendModule.cards && backendModule.cards.length > 0
                            ? backendModule.cards.map(c => ({
                                id: c.id, // ВАЖЛИВО: зберігаємо ID з бекенду
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

        // Обробка карток: зберігаємо ID, якщо це не timestamp (нове створення)
        const processedCards = formData.cards.map(c => {
            const cardData = {
                original: c.term,
                translation: c.definition
            };

            // Перевірка ID:
            // Якщо ID існує і він менше за поточний timestamp (приблизно 2023 рік в мс),
            // то це, ймовірно, ID з бази даних (int), а не Date.now().
            // 1700000000000 - це кінець 2023 року. ID з бази будуть 1, 2, 100 тощо.
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
            cards: processedCards // Відправляємо картки з правильними ID
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