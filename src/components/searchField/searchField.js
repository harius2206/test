import React, { useState, useEffect, useRef } from "react";
import "./searchField.css";
import searchIcon from "./searchIcon.svg";

export default function SearchField({
                                        placeholder = "search",
                                        width = "280px",
                                        height = "40px",
                                        className = "",
                                        value: controlledValue,
                                        onChange,
                                        data = [],
                                        onSearch,
                                        style = {},
                                        debounceMs = 200
                                    }) {
    const [query, setQuery] = useState(controlledValue ?? "");
    const debRef = useRef(null);

    useEffect(() => {
        if (controlledValue !== undefined && controlledValue !== query) {
            setQuery(controlledValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledValue]);

    useEffect(() => {
        if (debRef.current) clearTimeout(debRef.current);
        if (!onSearch || !data) return;
        debRef.current = setTimeout(() => {
            const q = (query || "").toLowerCase();
            const filtered = data.filter((u) =>
                (u.name || "").toLowerCase().includes(q)
            );
            onSearch(filtered);
        }, debounceMs);
        return () => clearTimeout(debRef.current);
    }, [query, data, onSearch, debounceMs]);

    const handleChange = (e) => {
        const v = e.target.value;
        if (controlledValue === undefined) setQuery(v);
        else setQuery(v); // keep visual sync for controlled as well
        onChange?.(v);
        // immediate onSearch for callers who prefer instant filtering (in addition to debounced)
        // main filtered callback will run via debounced effect
    };

    const wrapperStyle = { width, height, ...style };

    return (
        <div className={`search-wrapper ${className}`} style={wrapperStyle}>
            <img src={searchIcon} alt="Search" className="search-icon" />
            <input
                type="text"
                value={query}
                onChange={handleChange}
                className="search-input"
                placeholder={placeholder}
                aria-label={placeholder}
            />
        </div>
    );
}