import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

// Отримати список папок
export const getFolders = (params) => axiosClient.get(endpoints.folders.list, { params });

// Отримати деталі папки
export const getFolder = (id) => axiosClient.get(endpoints.folders.detail(id));

// Створити папку
export const createFolder = (data) => axiosClient.post(endpoints.folders.list, data);

// Оновити папку
export const updateFolder = (id, data) => axiosClient.patch(endpoints.folders.detail(id), data);

// Видалити папку
export const deleteFolder = (id) => axiosClient.delete(endpoints.folders.detail(id));

// Змінити видимість
export const toggleFolderVisibility = (id, visibleStatus) =>
    axiosClient.patch(endpoints.folders.visibles(id), { visible: visibleStatus });

// Додати модуль у папку
// [FIX] Додано порожній об'єкт {}, щоб відправити Content-Type: application/json
export const addModuleToFolder = (folderId, moduleId) =>
    axiosClient.post(endpoints.folders.modules(folderId, moduleId), {});

// Видалити модуль з папки
export const removeModuleFromFolder = (folderId, moduleId) =>
    axiosClient.delete(endpoints.folders.modules(folderId, moduleId));

// Зберегти папку (Saves)
// [FIX] Додано порожній об'єкт {}
export const saveFolder = (id) => axiosClient.post(endpoints.folders.saves(id), {});

// Видалити зі збережених
export const unsaveFolder = (id) => axiosClient.delete(endpoints.folders.saves(id));