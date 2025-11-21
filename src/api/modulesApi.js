import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

/**
 * Отримати список модулів з фільтрацією
 * params: { page, page_size, ordering, name, topic, cards_count__gt, etc. }
 */
export const getModules = (params) => {
    return axiosClient.get(endpoints.modules.list, { params });
};


export const getModuleById = (id) => {
    return axiosClient.get(endpoints.modules.detail(id));
};

/**
 * Створити новий модуль
 * data: { name, description, topic, lang_from, lang_to, cards: [...] }
 */
export const createModule = (data) => {
    return axiosClient.post(endpoints.modules.list, data);
};

/**
 * Оновити існуючий модуль
 * data: { name, description, cards: [...] }
 */
export const updateModule = (id, data) => {
    return axiosClient.patch(endpoints.modules.detail(id), data);
};


export const deleteModule = (id) => {
    return axiosClient.delete(endpoints.modules.detail(id));
};

export const getLanguages = () => {
    return axiosClient.get(endpoints.languages);
};

export const rateModule = (id, rating) => {
    return axiosClient.post(endpoints.modules.rate(id), { rating });
};

export const getTopics = () => {
    return axiosClient.get(endpoints.topics.list);
};