import { useState, useRef, useEffect } from "react";
import "./editableField.css";
import editImg from "../../images/editImg.svg";

export default function EditableField({
                                          label,
                                          type = "text", // "text" | "textarea"
                                          value: initialValue = "",
                                          editable = true,
                                          autosave = false,
                                          onSave = () => {},
                                          inputRef = null,
                                          placeholder = "",
                                          showEditIconWhenAutosave = false
                                      }) {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const internalTextareaRef = useRef(null);
    const actualRef = inputRef || internalTextareaRef;

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (type === "textarea" && actualRef && actualRef.current) {
            const ta = actualRef.current;
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }
    }, [value, type, actualRef]);

    const handleClick = () => {
        if (editable && !isEditing) {
            setIsEditing(true);
            // focus when entering edit mode
            setTimeout(() => actualRef?.current?.focus(), 0);
        }
    };

    const handleBlur = () => {
        if (editable) {
            setIsEditing(false);
            if (autosave) {
                onSave(value);
            }
        }
    };

    const handleChange = (e) => {
        setValue(e.target.value);
        if (autosave) {
            onSave(e.target.value);
        }
    };

    const shouldShowEditIcon = editable && ( !autosave || showEditIconWhenAutosave );

    return (
        <label className={`editable-field ${!editable ? "not-editable" : ""}`}>
            {label}
            <div className="editable-wrapper" onClick={handleClick}>
                {type === "textarea" ? (
                    <textarea
                        ref={actualRef}
                        value={value}
                        readOnly={!isEditing && !autosave}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder={placeholder}
                    />
                ) : (
                    <input
                        ref={actualRef}
                        type={type}
                        value={value}
                        readOnly={!isEditing && !autosave}
                        onBlur={handleBlur}
                        onChange={handleChange}
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