import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

export const getModules = (params) => axiosClient.get(endpoints.modules.list, { params });
export const getModuleById = (id) => axiosClient.get(endpoints.modules.detail(id));
export const createModule = (data) => axiosClient.post(endpoints.modules.list, data);
export const updateModule = (id, data) => axiosClient.patch(endpoints.modules.detail(id), data);
export const deleteModule = (id) => axiosClient.delete(endpoints.modules.detail(id));

export const addModulePermission = (id, userId, perm = "editor") => {
    return axiosClient.post(endpoints.modules.perms(id), { perm, user: userId });
};

export const removeModulePermission = (id, userId) => {
    return axiosClient.delete(endpoints.modules.permsDetail(id, userId));
};

export const toggleModuleVisibility = (id, status) => {
    return axiosClient.patch(endpoints.modules.visibles(id), { visible: status });
};

export const pinModule = (id) => {
    return axiosClient.post(endpoints.modules.pins(id), {});
};

export const saveModule = (id) => axiosClient.post(endpoints.modules.saves(id), {});

export const rateModule = (id, rating) => {
    return axiosClient.post(endpoints.modules.rates(id), { rate: rating });
};

export const addModuleTags = (id, tagsArray) => {
    return axiosClient.post(endpoints.modules.tags(id), { tags: tagsArray });
};

export const removeModuleTag = (id, tagName) => {
    return axiosClient.delete(endpoints.modules.tagsDetail(id, tagName));
};

export const getLanguages = () => axiosClient.get(endpoints.languages);
export const getTopics = () => axiosClient.get(endpoints.topics.list);

export const getModuleCards = (moduleId, params) =>
    axiosClient.get(endpoints.modules.cards.list(moduleId), { params });
export const createCard = (moduleId, data) =>
    axiosClient.post(endpoints.modules.cards.list(moduleId), data);
export const updateCard = (moduleId, cardId, data) =>
    axiosClient.patch(endpoints.modules.cards.detail(moduleId, cardId), data);
export const updateCardLearnStatus = (moduleId, cardId, status) =>
    axiosClient.post(endpoints.modules.cards.learn(moduleId, cardId), { learned: status });