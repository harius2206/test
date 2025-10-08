import React from "react";
import { useLocation } from "react-router-dom";
import ModuleForm from "./ModuleForm";

export default function CreateModule() {
    const location = useLocation();
    const mode = location.state?.mode === "edit" ? "edit" : "create";
    const initialData = location.state?.module || {};

    return (
        <ModuleForm
            mode={mode}
            initialData={initialData}
            onSubmit={(data) => console.log(mode === "edit" ? "Edit" : "Create", data)}
            onSubmitAndPractice={(data) => console.log((mode === "edit" ? "Edit" : "Create") + " + practise", data)}
        />
    );
}