import axiosClient from "./axiosClient";

export const registerUser = (data) =>
    axiosClient.post("/api/v1/auth/registration/", data);

export const verifyEmail = async (key) =>
    axiosClient.post("/api/v1/auth/registration/verify-email/", { key });