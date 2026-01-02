import React, { useState, useEffect } from "react";
import { getUsersList } from "../../api/usersApi";
import UserAvatar from "../avatar/avatar";
import { ReactComponent as CloseIcon } from "../../images/close.svg";
import { ReactComponent as DeleteIcon } from "../../images/delete.svg";
import { ReactComponent as AddIcon } from "../../images/add.svg";
import "./permissionMenu.css";

// Хук для затримки пошуку
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function PermissionsMenu({ users = [], onAddUser, onRemoveUser, onClose }) {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    // Логіка пошуку
    useEffect(() => {
        if (!debouncedSearch || debouncedSearch.length < 2) {
            setSearchResults([]);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // ВИПРАВЛЕНО: Використовуємо параметр 'username' згідно з Swagger
                const response = await getUsersList({ username: debouncedSearch });

                // Фільтруємо вже доданих користувачів
                const existingIds = new Set(users.map(u => u.id));
                const filtered = (response.data.results || response.data || []).filter(u => !existingIds.has(u.id));

                setSearchResults(filtered);
            } catch (error) {
                console.error("User search failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [debouncedSearch, users]);

    return (
        // Використовуємо клас з вашого CSS
        <div className="pm-permissions-menu" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Manage Access</span>
                <button className="pm-btn-icon" onClick={onClose}>
                    <CloseIcon />
                </button>
            </div>

            {/* Простий інпут для пошуку (стилізуємо інлайн, бо в CSS немає класу для інпуту) */}
            <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--perm-border)",
                    background: "var(--perm-bg)",
                    color: "var(--perm-text)",
                    fontSize: "14px",
                    marginBottom: "8px",
                    boxSizing: "border-box",
                    outline: "none"
                }}
                autoFocus
            />

            {/* Результати пошуку */}
            {search.length > 0 && (
                <div className="pm-user-list">
                    {loading ? (
                        <div style={{ padding: "8px", fontSize: "13px", color: "var(--perm-muted)", textAlign: "center" }}>Searching...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <div
                                key={user.id}
                                className="pm-user-item"
                                onClick={() => {
                                    onAddUser(user);
                                    setSearch("");
                                    setSearchResults([]);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="pm-user-left">
                                    <UserAvatar name={user.username} src={user.avatar} className="user-avatar" size={22} />
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
                {users.length === 0 && !search && (
                    <div style={{ padding: "8px", fontSize: "13px", color: "var(--perm-muted)", textAlign: "center" }}>
                        Only you have access
                    </div>
                )}

                {users.map(user => (
                    <div key={user.id} className="pm-user-item">
                        <div className="pm-user-left">
                            <UserAvatar name={user.username} src={user.avatar} className="user-avatar" size={22} />
                            <span className="pm-user-name">{user.username}</span>
                        </div>
                        <div className="pm-user-right">
                            <span className="pm-user-role">Editor</span>
                            <button
                                className="pm-btn-icon"
                                onClick={() => onRemoveUser(user.id)}
                                title="Remove access"
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pm-permissions-footer">
                <button className="pm-btn-primary" onClick={onClose}>Done</button>
            </div>
        </div>
    );
}