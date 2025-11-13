import axiosNoAuth from "./axiosNoAuth";
import endpoints from "./endpoints";

export const registerUser = (data) =>
    axiosNoAuth.post(endpoints.auth.register, data);

export const verifyEmail = (key) =>
    axiosNoAuth.post("/api/v1/auth/registration/verify-email/", { key });

export const githubLogin = (code) =>
    axiosNoAuth.post("/api/v1/auth/login/github/callback/", { code });

export const loginUser = (data) => {
    const payload = {
        username: data.username,
        email: data.email || "",
        password: data.password,
    };
    return axiosNoAuth.post(endpoints.auth.login, payload);
};
