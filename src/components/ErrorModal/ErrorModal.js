import React from "react";
import "./errorModal.css";

export default function ErrorModal({ error, onClose }) {
    if (!error) return null;
    return (
        <div className="error-overlay" onClick={onClose}>
            <div className="error-box" onClick={(e) => e.stopPropagation()}>
                <h3>Помилка</h3>
                <pre>{typeof error === "string" ? error : JSON.stringify(error, null, 2)}</pre>
                <button onClick={onClose}>Закрити</button>
            </div>
        </div>
    );
}
