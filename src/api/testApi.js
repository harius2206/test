import axiosClient from "./axiosClient";

export async function getApiRoot() {
    return await axiosClient.get("/");
}