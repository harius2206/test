import React, { createContext, useContext, useState } from "react";
import ModalMessage from "../components/ModalMessage/ModalMessage";
import { parseApiErrors } from "../utils/parseApiErrors";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
    const [modal, setModal] = useState({ open: false, type: "error", message: "" });

    const formatErrorMessage = (err, fallback = "An unexpected error occurred.") => {
        if (!err) return fallback;

        if (typeof err === "string") return err;

        if (err instanceof Error && err.message) return err.message;

        const data = err?.response?.data ?? err?.data ?? null;

        if (data) {
            if (typeof data === "string") return data;

            if (typeof data.detail === "string") return data.detail;

            if (data.non_field_errors) {
                if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(" ");
                return String(data.non_field_errors);
            }

            if (typeof data === "object") {
                const parts = parseApiErrors(data);
                if (parts.length > 0) return parts.join(" ");
            }
        }

        if (err.message) return err.message;
        try {
            return JSON.stringify(err).slice(0, 500);
        } catch {
            return fallback;
        }
    };

    const showMessage = (message, type = "info") => {
        setModal({ open: true, type, message: message || "" });
    };

    const showError = (err, fallbackMessage = "An unexpected error occurred.") => {
        const message = formatErrorMessage(err, fallbackMessage);
        console.error("showError:", err);
        setModal({ open: true, type: "error", message });
    };

    const showApiErrors = (err, fallbackMessage = "An unexpected error occurred.") => {
        showError(err, fallbackMessage);
    };

    const closeModal = () => setModal((m) => ({ ...m, open: false }));

    return (
        <ErrorContext.Provider value={{ showMessage, showError, showApiErrors }}>
            {children}
            <ModalMessage
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={closeModal}
            />
        </ErrorContext.Provider>
    );
}

export function useError() {
    return useContext(ErrorContext);
}
