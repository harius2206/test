// File: `src/components/permissionMenu/permissionsMenu.js`
import React, { useState, useEffect } from "react";
import DropdownMenu from "../dropDownMenu/dropDownMenu";
import SearchField from "../searchField/searchField";
import UserAvatar from "../avatar/avatar";
import { ReactComponent as DotsIcon } from "../../images/dots.svg";
import "./permissionMenu.css";

export default function PermissionsMenu({ users = [], onClose }) {
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const updatePermission = (id, role) => {
        setFilteredUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    };

    return (
        <div className="pm-permissions-menu" role="dialog" aria-label="Permissions">
            <div style={{ maxWidth: 360, width: "100%", overflow: "hidden", marginBottom: 8 }}>
                <SearchField
                    data={users}
                    onSearch={(results) => setFilteredUsers(results)}
                    placeholder="search user"
                    width="100%"
                    height="36px"
                />
            </div>

            <div className="pm-user-list">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="pm-user-item">
                        <div className="pm-user-left">
                            <UserAvatar name={user.name} avatar={user.avatar} size={22} />
                            <span className="pm-user-name">{user.name}</span>
                        </div>

                        <div className="pm-user-right">
                            <span className="pm-user-role">{user.role}</span>

                            <DropdownMenu
                                align="right"
                                width={120}
                                items={[
                                    { label: "Edit", onClick: () => updatePermission(user.id, "Edit") },
                                    { label: "Review", onClick: () => updatePermission(user.id, "Review") },
                                    { label: "None", onClick: () => updatePermission(user.id, "None") },
                                ]}
                            >
                                <button className="pm-btn-icon" aria-label="Folder menu">
                                    <DotsIcon width={16} height={16} />
                                </button>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pm-permissions-footer">
                {onClose && (
                    <button className="pm-btn-primary" onClick={onClose}>Close</button>
                )}
            </div>
        </div>
    );
}