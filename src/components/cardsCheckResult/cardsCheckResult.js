import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "../button/button";
import "./cardsCheckResult.css";

export default function CardsCheckResult({ learned, notLearned, total, time, avg, onRetry }) {
    const [themeColors, setThemeColors] = useState({
        text: "#000",
        path: "#6ADE5A",
        trail: "#DE5A5A",
        accent: "#6366f1",
        black: "#000000",
    });

    useEffect(() => {
        const root = getComputedStyle(document.documentElement);

        // parse rgb(a) or hex color string into [r,g,b]
        const parseColor = (input) => {
            if (!input) return null;
            const s = input.trim();
            const rgbMatch = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (rgbMatch) return [ +rgbMatch[1], +rgbMatch[2], +rgbMatch[3] ];
            const hexMatch = s.replace("#","").trim();
            if (hexMatch.length === 3) {
                return [
                    parseInt(hexMatch[0]+hexMatch[0], 16),
                    parseInt(hexMatch[1]+hexMatch[1], 16),
                    parseInt(hexMatch[2]+hexMatch[2], 16),
                ];
            }
            if (hexMatch.length === 6) {
                return [
                    parseInt(hexMatch.substring(0,2), 16),
                    parseInt(hexMatch.substring(2,4), 16),
                    parseInt(hexMatch.substring(4,6), 16),
                ];
            }
            return null;
        };

        // compute relative luminance then decide black/white contrast
        const getContrastFor = (colorStr) => {
            const rgb = parseColor(colorStr);
            if (!rgb) return "#000";
            const srgb = rgb.map((v) => {
                const c = v / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
            // threshold: if background is light -> use black, else white
            return lum > 0.5 ? "#000000" : "#FFFFFF";
        };

        const getBgCandidate = () => {
            // try a few likely CSS variables, fallback to computed body background
            return (
                root.getPropertyValue("--background") ||
                root.getPropertyValue("--bg") ||
                root.getPropertyValue("--app-bg") ||
                getComputedStyle(document.body).backgroundColor ||
                ""
            );
        };

        const updateColors = () => {
            const ccrTextVar = root.getPropertyValue("--ccr-text").trim();
            const path = root.getPropertyValue("--ccr-learned").trim() || "#6ADE5A";
            const trail = root.getPropertyValue("--ccr-notlearned").trim() || "#DE5A5A";
            const bg = getBgCandidate();
            const text = ccrTextVar || getContrastFor(bg);
            setThemeColors({
                text,
                path,
                trail,
                accent: "#6366f1",
                black: "#000000",
            });
        };

        updateColors();

        // observe attribute changes on root (theme toggles often change data-theme/class)
        const observer = new MutationObserver(() => {
            // re-read computed styles and update colors
            updateColors();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });

        return () => observer.disconnect();
    }, []);

    const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;

    return (
        <div className="ccr-container">
            <div className="ccr-stats-wrapper">
                <div className="ccr-progress">
                    <CircularProgressbar
                        value={percentage}
                        text={`${percentage}%`}
                        strokeWidth={14}
                        styles={buildStyles({
                            textColor: themeColors.text, // now adapts to theme
                            pathColor: themeColors.path,
                            trailColor: themeColors.trail,
                            textSize: "18px",
                            pathTransitionDuration: 0.1,
                            strokeLinecap: "butt",
                        })}
                    />
                </div>

                <div className="ccr-stats">
                    <p>
                        <span className="ccr-learned">Learned </span>
                        <span className="ccr-learned ccr-count">{learned}</span>
                    </p>
                    <p>
                        <span className="ccr-notlearned">Not learned </span>
                        <span className="ccr-notlearned ccr-count">{notLearned}</span>
                    </p>
                </div>
            </div>

            <div className="ccr-footer-row">
                <div className="ccr-time">
                    <p>Time: {time}s.</p>
                    <p>Average time: {avg}s.</p>
                </div>

                <Button
                    variant="outlined"
                    style={{
                        backgroundColor: themeColors.black,
                        color: themeColors.accent,
                        border: `2px solid ${themeColors.accent}`,
                        height: 50,
                        width: 150,
                        fontWeight: 600,
                        fontSize: "15px",
                        transition: "background 0.2s ease, opacity 0.2s ease",
                    }}
                    onClick={onRetry}
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}
