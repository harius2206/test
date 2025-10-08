import React from "react";

export default function ColoredIcon({ icon: Icon, color = "#000", size = 18, enabled = true }) {
    return enabled ? <Icon fill={color} width={size} height={size} /> : <Icon width={size} height={size} />;
}
