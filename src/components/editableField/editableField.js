import { useState, useRef, useEffect } from "react";
import "./editableField.css";
import editImg from "../../images/editImg.svg";

export default function EditableField({
                                          label,
                                          type = "text",        // "text" | "textarea"
                                          value: initialValue = "",
                                          editable = true,
                                          autosave = false,
                                          onSave = () => {},
                                          inputRef = null,
                                          placeholder = "",
                                          showEditIconWhenAutosave = false,
                                      }) {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const internalRef = useRef(null);
    const actualRef = inputRef || internalRef;

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (type === "textarea" && actualRef.current) {
            const ta = actualRef.current;
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }
    }, [value, type, actualRef]);

    const beginEdit = () => {
        if (!editable) return;
        setIsEditing(true);
        setTimeout(() => actualRef.current?.focus(), 0);
    };

    const finishEdit = () => {
        if (!editable) return;
        setIsEditing(false);

        if (autosave) {
            onSave(value);
        }
    };

    const handleBlur = () => {
        finishEdit();
    };

    const handleChange = (e) => {
        setValue(e.target.value);

        if (type === "password") {
            onSave(e.target.value);
        }
    };


    const handleKeyDown = (e) => {
        if (type !== "textarea" && e.key === "Enter") {
            e.preventDefault();
            actualRef.current.blur(); // triggers autosave
        }
    };

    const shouldShowEditIcon =
        editable && (!autosave || showEditIconWhenAutosave);

    const isReadOnly = !editable || (!isEditing && !autosave);

    return (
        <label className={`editable-field ${!editable ? "not-editable" : ""}`}>
            {label}

            <div className="editable-wrapper" onClick={beginEdit}>
                {type === "textarea" ? (
                    <textarea
                        ref={actualRef}
                        value={value}
                        readOnly={isReadOnly}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                    />
                ) : (
                    <input
                        ref={actualRef}
                        type={type}
                        value={value}
                        readOnly={isReadOnly}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                    />
                )}

                {shouldShowEditIcon && (
                    <span className="edit-icon">
                        <img src={editImg} alt="edit" />
                    </span>
                )}
            </div>
        </label>
    );
}
