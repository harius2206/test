import React, { useState, useRef } from "react";
import ClickOutsideWrapper from "../clickOutsideWrapper";
import "./dropDownMenu.css";

export default function DropdownMenu({
                                         items = [],
                                         children,
                                         align = "left",
                                         width = 180,
                                         open: controlledOpen,
                                         setOpen: controlledSetOpen
                                     }) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const btnRef = useRef(null);

    const isControlled = controlledOpen !== undefined && controlledSetOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? controlledSetOpen : setUncontrolledOpen;

    const getMenuStyle = () => {
        if (!btnRef.current) return {};
        return {
            top: `${btnRef.current.offsetHeight + 4}px`,
            [align]: "0",
            width: `${width}px`
        };
    };

    return (
        <div className="dm-wrapper" ref={btnRef}>
            <div
                className="dm-trigger"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
            >
                {children}
            </div>

            {open && (
                <ClickOutsideWrapper onClickOutside={() => setOpen(false)}>
                    <div className="dm-menu" style={getMenuStyle()}>
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="dm-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick?.(e, btnRef.current);
                                    setOpen(false);
                                }}
                            >
                                {item.icon && <span className="dm-icon">{item.icon}</span>}
                                <span className="dm-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </ClickOutsideWrapper>
            )}
        </div>
    );
}