import React from "react";

const DiagonalFlag43 = ({ flag1, flag2, width = 40, height = 30 }) => {
    // Я змінив дефолтні розміри на менші (40x30), щоб вони нормально виглядали в картці,
    // але ти можеш передавати свої через пропси.
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ minWidth: width }}>
            <defs>
                <clipPath id={`clip1-${width}-${height}`}>
                    <polygon points={`0,0 ${width},0 0,${height}`} />
                </clipPath>
                <clipPath id={`clip2-${width}-${height}`}>
                    <polygon points={`${width},0 ${width},${height} 0,${height}`} />
                </clipPath>
            </defs>

            {/* Fallback: сірий фон, якщо картинки немає */}
            <rect width={width} height={height} fill="#eee" />

            {flag1 && (
                <image
                    href={flag1}
                    width={width}
                    height={height}
                    clipPath={`url(#clip1-${width}-${height})`}
                    preserveAspectRatio="xMidYMid slice"
                />
            )}

            {flag2 && (
                <image
                    href={flag2}
                    width={width}
                    height={height}
                    clipPath={`url(#clip2-${width}-${height})`}
                    preserveAspectRatio="xMidYMid slice"
                />
            )}
        </svg>
    );
};

export default DiagonalFlag43;