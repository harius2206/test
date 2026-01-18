import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

// --- Permissions ---
export const addModulePermission = (id, userId, perm = "editor") => {
    return axiosClient.post(endpoints.modules.perms(id), { perm, user: userId });
};
export const removeModulePermission = (id, userId) => {
    return axiosClient.delete(endpoints.modules.permsDetail(id, userId));
};
export const getModulePermissionsUsers = (id) => {
    return axiosClient.get(endpoints.modules.permsUsers(id));
};

// --- Modules ---
export const getModules = (params) => axiosClient.get(endpoints.modules.list, { params });
export const getModuleById = (id) => axiosClient.get(endpoints.modules.detail(id));
export const createModule = (data) => axiosClient.post(endpoints.modules.list, data);
export const updateModule = (id, data) => axiosClient.patch(endpoints.modules.detail(id), data);
export const deleteModule = (id) => axiosClient.delete(endpoints.modules.detail(id));
export const toggleModuleVisibility = (id, status) => axiosClient.patch(endpoints.modules.visibles(id), { visible: status });
export const pinModule = (id) => axiosClient.post(endpoints.modules.pins(id), {});
export const mergeModules = (data) => axiosClient.post(endpoints.modules.merge, data);
export const rateModule = (id, rating) => axiosClient.post(endpoints.modules.rates(id), { rate: rating });

// --- Module Saves ---
export const saveModule = (id) => axiosClient.post(endpoints.modules.saves(id), {});
export const unsaveModule = (id) => axiosClient.delete(endpoints.modules.saves(id));
export const getSavedModules = (userId) => axiosClient.get(endpoints.modules.saved(userId));

// --- Cards ---
export const getModuleCards = (params) => axiosClient.get(endpoints.cards.list, { params });

// Статус вивчення: true -> POST (вивчено), false -> DELETE (не вивчено)
export const updateCardLearnStatus = (cardId, status) => {
    const method = status ? 'post' : 'delete';
    return axiosClient[method](endpoints.cards.learn(cardId), {});
};

// Збереження карток
export const saveCard = (cardId) => axiosClient.post(endpoints.cards.saves(cardId), {});
export const unsaveCard = (cardId) => axiosClient.delete(endpoints.cards.saves(cardId));

// Отримання всіх збережених карток користувача
export const getSavedCards = (userId) => axiosClient.get(endpoints.cards.saved(userId));

// Ця функція потрібна для Cards.js, якщо ти хочеш фільтрувати по модулю,
// або просто як аліас для завантаження всіх засейвлених
export const getSavedCardsByModule = (moduleId, userId) => axiosClient.get(endpoints.cards.saved(userId));

// --- Other ---
export const getLanguages = () => axiosClient.get(endpoints.languages);
export const getTopics = () => axiosClient.get(endpoints.topics.list);