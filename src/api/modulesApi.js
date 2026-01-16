import axiosClient from "./axiosClient";
import endpoints from "./endpoints";


export const addModulePermission = (id, userId, perm = "editor") => {
    return axiosClient.post(endpoints.modules.perms(id), { perm, user: userId });
};

export const removeModulePermission = (id, userId) => {
    return axiosClient.delete(endpoints.modules.permsDetail(id, userId));
};

export const getModulePermissionsUsers = (id) => {
    return axiosClient.get(endpoints.modules.permsUsers(id));
};
export const mergeModules = (data) => {
    return axiosClient.post(endpoints.modules.merge, data);
};

export const getModules = (params) => axiosClient.get(endpoints.modules.list, { params });  //ToDo

export const getModuleById = (id) => axiosClient.get(endpoints.modules.detail(id));

export const createModule = (data) => axiosClient.post(endpoints.modules.list, data);

export const updateModule = (id, data) => axiosClient.patch(endpoints.modules.detail(id), data);

export const deleteModule = (id) => axiosClient.delete(endpoints.modules.detail(id));

export const toggleModuleVisibility = (id, status) => axiosClient.patch(endpoints.modules.visibles(id), { visible: status });

export const pinModule = (id) => axiosClient.post(endpoints.modules.pins(id), {});  //ToDo

export const saveModule = (id) => axiosClient.post(endpoints.modules.saves(id), {});    //ToDo

export const rateModule = (id, rating) => axiosClient.post(endpoints.modules.rates(id), { rate: rating });

export const getModuleCards = (moduleId, params) => axiosClient.get(endpoints.modules.cards.list(moduleId), { params });    //ToDo

export const updateCardLearnStatus = (moduleId, cardId, status) => axiosClient.post(endpoints.modules.cards.learn(moduleId, cardId),
    { learned: status });
export const getLanguages = () => axiosClient.get(endpoints.languages);

export const getTopics = () => axiosClient.get(endpoints.topics.list);

