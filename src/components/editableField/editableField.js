import { useState, useRef, useEffect } from "react";
import "./editableField.css";
import editImg from "../../images/editImg.svg"

export default function EditableField({
        label,
        type = "text", // "text" | "textarea"
        value: initialValue = "",
        editable = true,
    }) {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (type === "textarea" && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [value, type]);

    const handleClick = () => {
        if (editable && !isEditing) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        if (editable) {
            setIsEditing(false);
        }
    };

    return (
        <label
            className={`editable-field ${!editable ? "not-editable" : ""}`}
        >
            {label}
            <div className="editable-wrapper" onClick={handleClick}>
                {type === "textarea" ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        readOnly={!isEditing}
                        onBlur={handleBlur}
                        onChange={(e) => setValue(e.target.value)}
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        readOnly={!isEditing}
                        onBlur={handleBlur}
                        onChange={(e) => setValue(e.target.value)}
                    />
                )}

                {editable && (
                    <span className="edit-icon">
                        <img src={editImg} alt="edit" />
                    </span>
                )}
            </div>
        </label>
    );
}
