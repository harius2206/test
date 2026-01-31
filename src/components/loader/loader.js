import React from "react";
import "./loader.css";

const Loader = ({ fullscreen = false }) => {
    return (
        <div className={`loader-container ${fullscreen ? "fullscreen" : ""}`}>
            <div className="loader-spinner"></div>
        </div>
    );
};

export default Loader;