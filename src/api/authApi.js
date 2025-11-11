import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

export const registerUser = (data) =>
    axiosClient.post("/api/v1/auth/registration/", data);

export const verifyEmail = async (key) =>
    axiosClient.post("/api/v1/auth/registration/verify-email/", { key });

export const loginUser = (data) => {
    const payload = {
        username: data.username,
        email: data.email || "",
        password: data.password,
    };
    return axiosClient.post(endpoints.auth.login, payload);
};