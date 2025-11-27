import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

// ... існуючі методи ...
export const getModules = (params) => axiosClient.get(endpoints.modules.list, { params });
export const getModuleById = (id) => axiosClient.get(endpoints.modules.detail(id));
export const createModule = (data) => axiosClient.post(endpoints.modules.list, data);
export const updateModule = (id, data) => axiosClient.patch(endpoints.modules.detail(id), data);
export const deleteModule = (id) => axiosClient.delete(endpoints.modules.detail(id));

export const getLanguages = () => axiosClient.get(endpoints.languages);
export const getTopics = () => axiosClient.get(endpoints.topics.list);
export const rateModule = (id, rating) => axiosClient.post(endpoints.modules.rate(id), { rating });

export const getModuleCards = (moduleId, params) => {
    return axiosClient.get(endpoints.modules.cards.list(moduleId), { params });
};

export const updateCard = (moduleId, cardId, data) => {
    return axiosClient.patch(endpoints.modules.cards.detail(moduleId, cardId), data);
};

export const updateCardLearnStatus = (moduleId, cardId, status) => {
    return axiosClient.post(endpoints.modules.cards.learn(moduleId, cardId), { learned: status });
};

export const createCard = (moduleId, data) => {
    return axiosClient.post(endpoints.modules.cards.list(moduleId), data);
};