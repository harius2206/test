import { useEffect, useRef } from "react";

export default function ClickOutsideWrapper({ onClickOutside, children }) {
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                onClickOutside?.();
            }
        };
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [onClickOutside]);


    return <div ref={wrapperRef}>{children}</div>;
}