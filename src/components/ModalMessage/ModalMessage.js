import React from "react";
import "./modalMessage.css";

export default function ModalMessage({
                                         open,
                                         type = "info",
                                         title,
                                         message,
                                         onClose,
                                         onConfirm
                                     }) {
    if (!open) return null;

    const isError = type === "error";
    const isSuccess = type === "success";
    const isConfirm = type === "confirm";

    const headerText = title || (isError ? "Error" : isSuccess ? "Success" : isConfirm ? "Confirm" : "Message");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3 className={`modal-title ${type}`}>{headerText}</h3>
                <p className="modal-message">{message}</p>

                {isConfirm ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                        <button
                            className="modal-btn"
                            onClick={onClose}
                            style={{ background: "var(--clr-border-light, #e5e7eb)", color: "var(--clr-text, #374151)" }}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-btn error"
                            onClick={onConfirm}
                            style={{ background: "var(--status-red, #ef4444)", color: "#ffffff" }}
                        >
                            Confirm
                        </button>
                    </div>
                ) : (
                    <button className={`modal-btn ${type}`} onClick={onClose}>
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}