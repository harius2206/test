import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const axiosNoAuth = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

export default axiosNoAuth;
