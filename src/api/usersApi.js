import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

export const getUserDetails = (id) => {
    return axiosClient.get(endpoints.users.detail(id));
};

export const getUsersList = (params) => {
    return axiosClient.get(endpoints.users.list, { params });
};

export const getUsersRatings = () => {
    return axiosClient.get(endpoints.users.ratings);
};