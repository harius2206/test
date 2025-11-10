import React, { createContext, useContext, useState, useCallback } from "react";
import ModalMessage from "../components/ModalMessage/ModalMessage";

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
    const [modal, setModal] = useState({
        open: false,
        type: "info",
        message: "",
    });

    const showMessage = useCallback((message, type = "info") => {
        setModal({ open: true, type, message });
    }, []);

    const showError = useCallback((error) => {
        const code = error?.response?.status || error?.status || "unknown";
        showMessage(`Something went wrong. Error code: ${code}`, "error");
    }, [showMessage]);

    const closeModal = useCallback(() => {
        setModal({ open: false, type: "info", message: "" });
    }, []);

    return (
        <ErrorContext.Provider value={{ showError, showMessage }}>
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

export const useError = () => useContext(ErrorContext);
