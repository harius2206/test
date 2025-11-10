import React from "react";
import "./modalMessage.css";

export default function ModalMessage({
                                         open,
                                         type = "info",
                                         title,
                                         message,
                                         onClose
                                     }) {
    if (!open) return null;

    const isError = type === "error";
    const isSuccess = type === "success";

    const headerText = title || (isError ? "Error" : isSuccess ? "Success" : "Message");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3 className={`modal-title ${type}`}>{headerText}</h3>
                <p className="modal-message">{message}</p>
                <button className={`modal-btn ${type}`} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}
