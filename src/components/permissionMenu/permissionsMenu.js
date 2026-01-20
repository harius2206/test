import React, { useState, useEffect } from "react";
import { getUsersList } from "../../api/usersApi";
import { getModulePermissionsUsers } from "../../api/modulesApi";
import UserAvatar from "../avatar/avatar";
import { ReactComponent as CloseIcon } from "../../images/close.svg";
import { ReactComponent as DeleteIcon } from "../../images/delete.svg";
import { ReactComponent as AddIcon } from "../../images/add.svg";
import "./permissionMenu.css";

// Хук для debounce
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function PermissionsMenu({ moduleId, users = [], onAddUser, onRemoveUser, onClose }) {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // Локальний стейт для списку користувачів з доступом
    const [currentUsers, setCurrentUsers] = useState(users);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    // 1. Завантажуємо список користувачів з правами при монтуванні (якщо є moduleId)
    useEffect(() => {
        if (moduleId) {
            setLoadingUsers(true);
            getModulePermissionsUsers(moduleId)
                .then((response) => {
                    const mappedUsers = (response.data || []).map(item => item.user);
                    setCurrentUsers(mappedUsers);
                })
                .catch(err => console.error("Failed to fetch permissions", err))
                .finally(() => setLoadingUsers(false));
        } else {
            setCurrentUsers(users);
        }
    }, [moduleId, users]);

    // 2. Логіка пошуку нових користувачів
    useEffect(() => {
        if (!debouncedSearch || debouncedSearch.length < 2) {
            setSearchResults([]);
            return;
        }

        const fetchUsers = async () => {
            setLoadingSearch(true);
            try {
                const response = await getUsersList({ username: debouncedSearch });
                const existingIds = new Set(currentUsers.map(u => u.id));
                const filtered = (response.data.results || response.data || []).filter(u => !existingIds.has(u.id));

                setSearchResults(filtered);
            } catch (error) {
                console.error("User search failed", error);
            } finally {
                setLoadingSearch(false);
            }
        };

        fetchUsers();
    }, [debouncedSearch, currentUsers]);

    const handleAddClick = (userToAdd) => {
        onAddUser(userToAdd);
        setCurrentUsers(prev => [...prev, userToAdd]);
        setSearch("");
        setSearchResults([]);
    };

    const handleRemoveClick = (userId) => {
        onRemoveUser(userId);
        setCurrentUsers(prev => prev.filter(u => u.id !== userId));
    };

    return (
        <div className="pm-permissions-menu" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Manage Access</span>
                <button className="pm-btn-icon" onClick={onClose}>
                    <CloseIcon />
                </button>
            </div>

            <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "100%", padding: "6px 8px", borderRadius: "6px",
                    border: "1px solid var(--perm-border)", background: "var(--perm-bg)",
                    color: "var(--perm-text)", fontSize: "14px", marginBottom: "8px",
                    boxSizing: "border-box", outline: "none"
                }}
                autoFocus
            />

            {/* Результати пошуку */}
            {search.length > 0 && (
                <div className="pm-user-list">
                    {loadingSearch ? (
                        <div style={{ padding: "8px", fontSize: "13px", color: "var(--perm-muted)", textAlign: "center" }}>Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <div
                                key={user.id}
                                className="pm-user-item"
                                onClick={() => handleAddClick(user)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="pm-user-left">
                                    {/* Додано disableStrictFallback={true} */}
                                    <UserAvatar
                                        name={user.username}
                                        src={user.avatar}
                                        className="user-avatar"
                                        size={22}
                                        disableStrictFallback={true}
                                    />
                                    <span className="pm-user-name">{user.username}</span>
                                </div>
                                <div className="pm-user-right">
                                    <AddIcon width={16} height={16} style={{ fill: "var(--perm-purple)" }} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: "8px", fontSize: "13px", color: "var(--perm-muted)", textAlign: "center" }}>No users found</div>
                    )}
                    {searchResults.length > 0 && <div style={{ borderBottom: "1px solid var(--perm-border)", margin: "4px 0" }}></div>}
                </div>
            )}

            {/* Список поточних користувачів */}
            <div className="pm-user-list">
                {loadingUsers && !search ? (
                    <div style={{ padding: "8px", textAlign: "center", fontSize: "13px", color: "gray" }}>Loading permissions...</div>
                ) : (
                    <>
                        {currentUsers.length === 0 && !search && (
                            <div style={{ padding: "8px", fontSize: "13px", color: "var(--perm-muted)", textAlign: "center" }}>
                                Only you have access
                            </div>
                        )}

                        {currentUsers.map(user => (
                            <div key={user.id} className="pm-user-item">
                                <div className="pm-user-left">
                                    {/* Додано disableStrictFallback={true} */}
                                    <UserAvatar
                                        name={user.username}
                                        src={user.avatar}
                                        className="user-avatar"
                                        size={22}
                                        disableStrictFallback={true}
                                    />
                                    <span className="pm-user-name">{user.username}</span>
                                </div>
                                <div className="pm-user-right">
                                    <span className="pm-user-role">Editor</span>
                                    <button
                                        className="pm-btn-icon"
                                        onClick={() => handleRemoveClick(user.id)}
                                        title="Remove access"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <div className="pm-permissions-footer">
                <button className="pm-btn-primary" onClick={onClose}>Done</button>
            </div>
        </div>
    );
}