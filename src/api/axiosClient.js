import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearAuthData } from "../utils/storage";
import endpoints from "./endpoints";

const rawBaseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL.slice(0, -1) : rawBaseURL;

const axiosClient = axios.create({
    baseURL: rawBaseURL,
    headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

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

                processQueue(null, access);

                return axiosClient(originalRequest);

            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                processQueue(refreshError, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error.response || error);
    }
);

const handleLogout = () => {
    clearAuthData();
    window.location.href = "/login";
};

export default axiosClient;