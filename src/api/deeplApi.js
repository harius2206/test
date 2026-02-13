import axiosClient from "./axiosClient";

// GET /api/v1/deepl/
export const getDeeplKeys = () => {
    return axiosClient.get("/api/v1/deepl/");
};

// POST /api/v1/deepl/
export const createDeeplKey = (api_key) => {
    return axiosClient.post("/api/v1/deepl/", { api_key });
};

// GET /api/v1/deepl/{id}/
export const getDeeplKeyById = (id) => {
    return axiosClient.get(`/api/v1/deepl/${id}/`);
};

// PUT / PATCH
export const updateDeeplKey = (id, api_key) => {
    return axiosClient.patch(`/api/v1/deepl/${id}/`, { api_key });
};

// DELETE
export const deleteDeeplKey = (id) => {
    return axiosClient.delete(`/api/v1/deepl/${id}/`);
};

// POST /api/v1/deepl/translations/
export const translateWords = (words, lang_to) => {
    return axiosClient.post("/api/v1/deepl/translations/", {
        words,
        lang_to
    });
};
