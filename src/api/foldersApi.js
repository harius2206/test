import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

export const getFolders = (params) => axiosClient.get(endpoints.folders.list, { params });

export const getFolder = (id) => axiosClient.get(endpoints.folders.detail(id));

export const createFolder = (data) => axiosClient.post(endpoints.folders.list, data);

export const updateFolder = (id, data) => axiosClient.patch(endpoints.folders.detail(id), data);

export const deleteFolder = (id) => axiosClient.delete(endpoints.folders.detail(id));

export const toggleFolderVisibility = (id, visibleStatus) =>
    axiosClient.patch(endpoints.folders.visibles(id), { visible: visibleStatus });

export const addModuleToFolder = (folderId, moduleId) =>
    axiosClient.post(endpoints.folders.modules(folderId, moduleId), {});

export const removeModuleFromFolder = (folderId, moduleId) =>
    axiosClient.delete(endpoints.folders.modules(folderId, moduleId));

export const saveFolder = (id) => axiosClient.post(endpoints.folders.saves(id), {});

export const unsaveFolder = (id) => axiosClient.delete(endpoints.folders.saves(id));

export const getSavedFolders = (userId) => axiosClient.get(endpoints.folders.saved(userId));

// PINS
export const pinFolder = (id) => axiosClient.post(endpoints.folders.pins(id), {});
export const unpinFolder = (id) => axiosClient.delete(endpoints.folders.pins(id));
// Отримання списку закріплених папок
export const getPinnedFolders = (userId) => axiosClient.get(endpoints.folders.pinned(userId));