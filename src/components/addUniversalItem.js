import React, { useRef, useEffect, useState } from "react";
import EditableField from "./editableField/editableField";
import ColoredIcon from "./coloredIcon";
import Button from "./button/button";

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
        if (active && inputRef.current) {
            inputRef.current.focus();
        }
    }, [active]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorMenuRef.current && !colorMenuRef.current.contains(event.target)) {
                setColorMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCreate = () => {
        if (!values.name || values.name.trim() === "") return;
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
                        <span style={{ position: "relative" }}>
                            <span
                                onClick={() => setColorMenuOpen(true)}
                                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                            >
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
                                        flexWrap: "wrap",
                                        gap: 4,
                                        background: "#fff",
                                        border: "1px solid #ccc",
                                        padding: 6,
                                        borderRadius: 4,
                                        width: 120
                                    }}
                                >
                                    {colorOptions.map(c => (
                                        <button
                                            key={c}
                                            style={{
                                                background: c,
                                                width: 22,
                                                height: 22,
                                                cursor: "pointer",
                                                border: values.color === c ? "2px solid #000" : "1px solid #ddd",
                                                borderRadius: 2
                                            }}
                                            onClick={() => {
                                                setValues({ ...values, color: c });
                                                setColorMenuOpen(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </span>
                    )}
                    <EditableField
                        value={values.name || ""}
                        onSave={(val) => setValues({ ...values, name: val })}
                        editable={true}
                        autosave={true}
                        inputRef={inputRef}
                        placeholder={placeholder}
                    />
                </div>
            </div>
            <div className="folder-actions" style={{ display: "flex", gap: 8 }}>
                <Button width={70} height={24} variant="static" onClick={handleCreate}>Create</Button>
            </div>
        </div>
    );
}