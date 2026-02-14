import React, { useState } from "react";
import DropdownMenu from "../dropDownMenu/dropDownMenu";
import Button from "../button/button";
import { ReactComponent as IconArrowUp } from "../../images/arrowUp.svg";
import { ReactComponent as IconArrowDown } from "../../images/arrowDown.svg";
import { useI18n } from "../../i18n"; // <-- i18n

export default function SortMenu({ onSort }) {
    const { t } = useI18n(); // <-- використання i18n
    const [open, setOpen] = useState(false);

    const items = [
        {
            label: t("smByDate_label"),
            onClick: () => {
                onSort("date");
                setOpen(false);
            },
        },
        {
            label: t("smByName_label"),
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
                {t("smSort_btn")}
                {open ? (
                    <IconArrowUp style={{ width: 14, marginLeft: 8, fill: "white", height: 14 }} />
                ) : (
                    <IconArrowDown style={{ width: 14, marginLeft: 8, fill: "#6366f1", height: 14 }} />
                )}
            </Button>
        </DropdownMenu>
    );
}
