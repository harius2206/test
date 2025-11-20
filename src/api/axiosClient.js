import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearAuthData } from "../utils/storage";
import endpoints from "./endpoints";

const rawBaseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/";
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL.slice(0, -1) : rawBaseURL;

const axiosClient = axios.create({
    baseURL: rawBaseURL,
    headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                handleLogout();
                return Promise.reject(error);
            }

            try {
                const refreshUrl = `${baseURL}${endpoints.auth.refresh}`;

                const response = await axios.post(refreshUrl, {
                    refresh: refreshToken
                });

                const { access } = response.data;

                saveTokens(access, refreshToken);

                axiosClient.defaults.headers.common["Authorization"] = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return axiosClient(originalRequest);

            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                handleLogout();
                return Promise.reject(refreshError);
            }
        }

        throw error.response || error;
    }
);

const handleLogout = () => {
    clearAuthData();
    window.location.href = "/login";
};

export default axiosClient;