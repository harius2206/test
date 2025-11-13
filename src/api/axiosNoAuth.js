import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "https://fce0ae463dfc.ngrok-free.app/";

const axiosNoAuth = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

export default axiosNoAuth;
