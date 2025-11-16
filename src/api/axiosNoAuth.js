import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "https://ee00968a8650.ngrok-free.app/";

const axiosNoAuth = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

export default axiosNoAuth;
