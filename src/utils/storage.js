const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

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
export const clearAuthData = clearTokens;

export const saveUserData = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
};

export const getUserData = () => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
};
