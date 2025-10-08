import React, { useRef, useEffect, useState } from "react";
import EditableField from "./editableField/editableField";
import ColoredIcon from "./coloredIcon";

export default function AddUniversalItem({
                                             type = "module",
                                             fields = ["name"],
                                             onCreate,
                                             defaultValues = {},
                                             placeholder = "Enter name",
                                             icon: IconComponent = null,
                                             colorOptions = [],
                                             active = false,
                                             onClose = () => {}
                                         }) {
    const [values, setValues] = useState({ ...defaultValues });
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const colorMenuRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (active && inputRef.current) inputRef.current.focus();
    }, [active]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) {
                setColorMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    const handleCreate = () => {
        if (!values.name || !values.name.trim()) return;
        onCreate(values);
        setValues({ ...defaultValues });
        onClose();
    };

    if (!active) return null;

    return (
        <div className="module-card create">
            <div className="module-info">
                <div className="top-row">
                    <span className="terms-count">
                        {type === "folder" ? "0 modules" : "0 terms"}
                    </span>
                </div>

                <div className="module-name-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {fields.includes("color") && IconComponent && (
                        <span style={{ position: "relative", display: "inline-block" }}>
                            <span onClick={() => setColorMenuOpen(true)} style={{ cursor: "pointer" }}>
                                <ColoredIcon icon={IconComponent} color={values.color || "#6366f1"} size={20} />
                            </span>
                            {colorMenuOpen && (
                                <div
                                    className="color-picker-menu"
                                    ref={colorMenuRef}
                                    style={{
                                        position: "absolute",
                                        top: 28,
                                        left: 0,
                                        zIndex: 10,
                                        display: "flex",
                                        gap: 4,
                                        background: "#fff",
                                        border: "1px solid #ccc",
                                        borderRadius: 6,
                                        padding: 6
                                    }}
                                >
                                    {colorOptions.map(c => (
                                        <button
                                            key={c}
                                            className="color-square"
                                            style={{
                                                background: c,
                                                border: values.color === c ? "2px solid #000" : "2px solid transparent",
                                                width: 22,
                                                height: 22,
                                                borderRadius: 4,
                                                cursor: "pointer"
                                            }}
                                            onClick={() => {
                                                handleChange("color", c);
                                                setColorMenuOpen(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </span>
                    )}

                    {fields.includes("name") && (
                        <EditableField
                            value={values.name || ""}
                            onSave={(val) => handleChange("name", val)}
                            editable={true}
                            autosave={true}
                            inputRef={inputRef}
                            placeholder={placeholder}
                        />
                    )}
                </div>
            </div>

            <div className="folder-actions">
                <button className="btn-primary" onClick={handleCreate}>
                    Create
                </button>
            </div>
        </div>
    );
}