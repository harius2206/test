const DiagonalFlagRect = ({ flag1, flag2, width = 60, height = 40 }) => {
    // Спільні стилі для обох зображень, щоб уникнути дублювання
    const commonImgStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        border: 'none',
        outline: 'none',
        display: 'block',
        transform: 'scale(1.01)',
    };

    return (
        <div
            style={{
                position: 'relative',
                width: width,
                height: height,
                overflow: 'hidden',
                backgroundColor: 'transparent',
            }}
        >
            {/* Верхній лівий трикутник (Прапор 1) */}
            {flag1 && (
                <img
                    src={flag1}
                    alt="Flag 1"
                    style={{
                        ...commonImgStyle,
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                        zIndex: 1,
                    }}
                />
            )}

            {/* Нижній правий трикутник (Прапор 2) */}
            {flag2 && (
                <img
                    src={flag2}
                    alt="Flag 2"
                    style={{
                        ...commonImgStyle,
                        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                        zIndex: 0,
                    }}
                />
            )}
        </div>
    );
};

export default DiagonalFlagRect;