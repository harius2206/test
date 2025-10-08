import React, { useState } from "react";
import DropdownMenu from "./dropDownMenu/dropDownMenu";
import Button from "./button/button";
import { ReactComponent as IconArrowUp } from "../images/arrowUp.svg";
import { ReactComponent as IconArrowDown } from "../images/arrowDown.svg";

export default function SortMenu({ onSort }) {
    const [open, setOpen] = useState(false);

    const items = [
        {
            label: "By date",
            onClick: () => {
                onSort("date");
                setOpen(false);
            },
        },
        {
            label: "By name",
            onClick: () => {
                onSort("name");
                setOpen(false);
            },
        },
    ];

    return (
        <DropdownMenu
            items={items}
            align="left"
            width={140}
            open={open}
            setOpen={setOpen}
        >
            <Button
                variant="toggle"
                color="#6366f1"
                active={open}
                width={90}
                height={32}
                style={{ margin: "4px 0" }}
            >
                Sort
                {open ? (
                    <IconArrowUp style={{ width: 14, marginLeft: 8, fill: "white", height: 14 }} />
                ) : (
                    <IconArrowDown style={{ width: 14, marginLeft: 8, fill: "#6366f1", height: 14 }} />
                )}
            </Button>
        </DropdownMenu>
    );
}