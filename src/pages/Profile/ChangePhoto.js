import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { makeAspectCrop, centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Button from "../../components/button/button";
import { getUserAvatar, saveUserAvatar } from "../../utils/storage";
import "./profile.css";

export default function ChangePhoto() {
    const [src, setSrc] = useState(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [croppedImage, setCroppedImage] = useState(getUserAvatar());
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    const imgRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const saved = getUserAvatar();
        if (saved) setCroppedImage(saved);
    }, []);

    // Keep in sync with localStorage changes from other places
    useEffect(() => {
        const onStorage = () => {
            const saved = getUserAvatar();
            setCroppedImage(saved);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSrc(URL.createObjectURL(file));
            setIsEditing(true);
            setCrop(undefined);
            setHasChanged(true);
        }
    };

    const handleOpenFileDialog = () => fileInputRef.current?.click();

    const onPaste = useCallback((e) => {
        const item = Array.from(e.clipboardData.items).find((x) =>
            x.type.includes("image")
        );
        if (item) {
            const file = item.getAsFile();
            setSrc(URL.createObjectURL(file));
            setIsEditing(true);
            setHasChanged(true);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, [onPaste]);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const c = centerCrop(
            makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
            width,
            height
        );
        setCrop(c);
    };

    const getCroppedBase64 = useCallback(() => {
        if (!completedCrop || !imgRef.current) return null;
        const canvas = document.createElement("canvas");
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );
        return canvas.toDataURL("image/png");
    }, [completedCrop]);

    const handleCropConfirm = () => {
        const base64 = getCroppedBase64();
        if (base64) {
            setCroppedImage(base64);
            saveUserAvatar(base64);
            setIsEditing(false);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        setSrc(null);
        setHasChanged(false);
        // notify other components
        setTimeout(() => window.dispatchEvent(new Event("storage")), 200);
    };

    const handleDelete = () => {
        setCroppedImage(null);
        saveUserAvatar(null);
        setHasChanged(false);
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <div className="profile-section-wrapper">
            <div className="profile-section-header">
                <h1 className="profile-title">Change Photo</h1>
                <h2 className="profile-tile-description">
                    You can change your profile picture here.
                </h2>
            </div>

            <div className="photo-preview-container">
                <div className="photo-preview-box">
                    {isEditing && src ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                        >
                            <img
                                ref={imgRef}
                                src={src}
                                alt="Crop preview"
                                onLoad={onImageLoad}
                                className="photo-preview-img"
                            />
                        </ReactCrop>
                    ) : croppedImage ? (
                        <img
                            src={croppedImage}
                            alt="User avatar"
                            className="photo-avatar"
                        />
                    ) : (
                        <p className="photo-placeholder">
                            Upload or paste an image (Ctrl + V) to start editing.
                        </p>
                    )}
                </div>
            </div>

            <div className="photo-buttons-row">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="photo-upload-input"
                />

                <Button variant="hover" width={130} height={40} onClick={handleOpenFileDialog}>
                    {croppedImage ? "Change" : "Upload"}
                </Button>

                {hasChanged && !isEditing && (
                    <Button variant="static" width={130} height={40} onClick={handleSave}>
                        Save
                    </Button>
                )}

                {croppedImage && !isEditing && (
                    <Button variant="toggle" width={130} height={40} onClick={handleDelete}>
                        Delete
                    </Button>
                )}
            </div>

            {isEditing && (
                <div className="photo-buttons-row">
                    <Button variant="static" width={130} height={40} onClick={handleCropConfirm}>
                        Crop
                    </Button>
                    <Button variant="toggle" width={130} height={40} onClick={() => setIsEditing(false)}>
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
}