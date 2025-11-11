import axios from "axios";
import { getAccessToken } from "../utils/storage";

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://51db8c78286f.ngrok-free.app",
    headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        throw error.response || error;
    }
);

export default axiosClient;
