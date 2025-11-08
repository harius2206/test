import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

export const getUsers = () => axiosClient.get(endpoints.users.list);
export const getUserDetail = (id) => axiosClient.get(endpoints.users.detail(id));
