import { useState } from "react";
import { mergeModules } from "../api/modulesApi";

export const useMergeModules = (loadDataCallback) => {
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [selectedForMerge, setSelectedForMerge] = useState([]);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [mergeForm, setMergeForm] = useState({ name: "", topic: "" });

    const handleMergeToggle = (module) => {
        if (!isMergeMode) {
            setIsMergeMode(true);
            setSelectedForMerge([module]);
        } else {
            toggleModuleSelection(module);
        }
    };

    const toggleModuleSelection = (module) => {
        setSelectedForMerge(prev => {
            const isSelected = prev.some(m => m.id === module.id);
            if (isSelected) {
                return prev.filter(m => m.id !== module.id);
            } else {
                return [...prev, module];
            }
        });
    };

    const openFinalMergeModal = () => {
        if (selectedForMerge.length < 2) return;
        setMergeForm({
            name: `Merged (${selectedForMerge.length} modules)`,
            topic: selectedForMerge[0]?.topic?.id || selectedForMerge[0]?.topic || ""
        });
        setIsMergeModalOpen(true);
    };

    const executeMerge = async (onSuccess, onError) => {
        if (!mergeForm.name || !mergeForm.topic) return;
        try {
            await mergeModules({
                name: mergeForm.name,
                topic: parseInt(mergeForm.topic),
                modules: selectedForMerge.map(m => m.id)
            });

            setIsMergeMode(false);
            setSelectedForMerge([]);
            setIsMergeModalOpen(false);

            if (loadDataCallback) loadDataCallback();
            if (onSuccess) onSuccess();
        } catch (err) {
            if (onError) onError(err);
        }
    };

    const cancelMergeMode = () => {
        setIsMergeMode(false);
        setSelectedForMerge([]);
        setIsMergeModalOpen(false);
    };

    return {
        isMergeMode,
        setIsMergeMode,
        selectedForMerge,
        isMergeModalOpen,
        setIsMergeModalOpen,
        mergeForm,
        setMergeForm,
        handleMergeToggle,
        toggleModuleSelection,
        openFinalMergeModal,
        executeMerge,
        cancelMergeMode
    };
};