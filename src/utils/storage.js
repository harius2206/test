// src/utils/storage.js
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";
const AVATAR_KEY = "userAvatar";

/* ===== TOKENS ===== */
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (access, refresh) => {
    if (access == null) localStorage.removeItem(ACCESS_KEY);
    else localStorage.setItem(ACCESS_KEY, access);

    if (refresh == null) localStorage.removeItem(REFRESH_KEY);
    else localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
};

export const saveTokens = setTokens;
export const saveAuthTokens = setTokens;

/* ===== USER ===== */
export const saveUserData = (user) => {
    try {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
    } catch (e) {
        console.error("Failed to save user data:", e);
    }
};

export const getUserData = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearAuthData = () => {
    clearTokens();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AVATAR_KEY);
};

/* ===== AVATAR ===== */
export const saveUserAvatar = (base64) => {
    if (base64) localStorage.setItem(AVATAR_KEY, base64);
    else localStorage.removeItem(AVATAR_KEY);
};

export const getUserAvatar = () => localStorage.getItem(AVATAR_KEY);
