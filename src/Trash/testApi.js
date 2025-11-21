import axiosClient from "../api/axiosClient";

export async function getApiRoot() {
    return await axiosClient.get("/");
}