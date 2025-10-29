import React from "react";

const DiagonalFlag43 = ({ flag1, flag2, width = 160, height = 120 }) => {
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <clipPath id="clip1">
                    <polygon points={`0,0 ${width},0 0,${height}`} />
                </clipPath>
                <clipPath id="clip2">
                    <polygon points={`${width},0 ${width},${height} 0,${height}`} />
                </clipPath>
            </defs>

            <image
                href={flag1}
                width={width}
                height={height}
                clipPath="url(#clip1)"
                preserveAspectRatio="xMidYMid slice"
            />

            <image
                href={flag2}
                width={width}
                height={height}
                clipPath="url(#clip2)"
                preserveAspectRatio="xMidYMid slice"
            />
        </svg>
    );
};

export default DiagonalFlag43;
