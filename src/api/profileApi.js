import axiosClient from "./axiosClient";

export const fetchCurrentUser = () => {
    return axiosClient.get("/api/v1/auth/user/");
};