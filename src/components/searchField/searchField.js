import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getModules } from "../../api/modulesApi";
import "./searchField.css";
import searchIcon from "./searchIcon.svg";
import { useI18n } from "../../i18n";

export default function SearchField({
                                        placeholder = "search",
                                        width = "320px",
                                        height = "40px",
                                        debounceMs = 500
                                    }) {
    const { t } = useI18n();
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const debRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (debRef.current) clearTimeout(debRef.current);
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        debRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const resp = await getModules({ name: query });
                setResults(resp.data.results || []);
                setIsOpen(true);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        return () => clearTimeout(debRef.current);
    }, [query, debounceMs]);

    const handleSelect = (moduleId) => {
        setIsOpen(false);
        setQuery("");
        navigate(`/library/module-view?id=${moduleId}`);
    };

    return (
        <div className="sf-wrapper-container" ref={wrapperRef} style={{ width }}>
            <div className="sf-wrapper" style={{ height }}>
                <img src={searchIcon} alt="search" className="sf-icon" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="sf-input"
                    placeholder={t(placeholder)}
                    onFocus={() => query && setIsOpen(true)}
                />
            </div>

            {isOpen && (
                <div className="sf-results-dropdown">
                    {loading && <div className="sf-status">{t("searching")}</div>}
                    {!loading && results.length === 0 && (
                        <div className="sf-status">{t("noResults")}</div>
                    )}
                    {results.map((module) => (
                        <div
                            key={module.id}
                            className="sf-result-item"
                            onClick={() => handleSelect(module.id)}
                        >
                            <div className="sf-item-info">
                                <span className="sf-item-name">{module.name}</span>
                                {module.description && <span className="sf-item-desc">{module.description}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}