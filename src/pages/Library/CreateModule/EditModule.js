import React from "react";
import { useLocation } from "react-router-dom";
import ModuleForm from "./ModuleForm";

export default function EditModule() {
    const { state } = useLocation();
    const moduleData = state?.module || {
        id: 123,
        name: "My module",
        description: "Example description",
        tags: ["sample", "demo"],
        cards: [{ id: 1, term: "one", definition: "один" }],
        globalLangLeft: "English",
        globalLangRight: "Ukrainian",
    };

    return (
        <ModuleForm
            mode="edit"
            initialData={moduleData}
            onSubmit={(data)=>console.log("Save", data)}
            onSubmitAndPractice={(data)=>console.log("Save + practise", data)}
        />
    );
}
