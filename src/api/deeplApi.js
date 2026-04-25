import axiosClient from "./axiosClient";

export const getDeeplKeys = () => {
    return axiosClient.get("/api/v1/deepl/");
};

export const createDeeplKey = (api_key) => {
    return axiosClient.post("/api/v1/deepl/", { api_key });
};

export const getDeeplKeyById = (id) => {
    return axiosClient.get(`/api/v1/deepl/${id}/`);
};

export const updateDeeplKey = (id, api_key) => {
    return axiosClient.patch(`/api/v1/deepl/${id}/`, { api_key });
};

export const deleteDeeplKey = (id) => {
    return axiosClient.delete(`/api/v1/deepl/${id}/`);
};

export const translateWords = (words, lang_to) => {
    return axiosClient.post("/api/v1/deepl/translations/", {
        words,
        lang_to
    });
};
