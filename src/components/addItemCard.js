// components/addItemCard/addItemCard.jsx
import React, { useState, useRef, useEffect } from "react";
import EditableField from "./editableField/editableField";

export default function AddItemCard({
                                        label = "item",
                                        placeholder = "Enter name",
                                        onCreate,
                                        icon = null,
                                        defaultColor = null,
                                        colorPicker = null
                                    }) {
    const [isAdding, setIsAdding] = useState(false);
    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    const handleCreate = () => {
        if (!value.trim()) return;
        onCreate(value);
        setValue("");
        setIsAdding(false);
    };

    return (
        <div>
            {isAdding ? (
                <div
                    className="module-card create"
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        height: 40,
                        padding: "0 12px",
                        minWidth: 220,
                        gap: 8
                    }}
                >
                    {icon}
                    <EditableField
                        value={value}
                        onSave={setValue}
                        editable={true}
                        autosave={true}
                        inputRef={inputRef}
                        placeholder={placeholder}
                    />
                    {colorPicker}
                    <button
                        className="btn-primary"
                        style={{ height: 28, padding: "0 14px" }}
                        onClick={handleCreate}
                    >
                        Create
                    </button>
                </div>
            ) : (
                <button
                    className="add-btn"
                    style={{
                        background: "#fff",
                        color: "#6366f1",
                        border: "1px solid #ccc",
                        height: 40,
                        minWidth: 140,
                        borderRadius: 6,
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                    onClick={() => setIsAdding(true)}
                >
                    Add {label}
                </button>
            )}
        </div>
    );
}
