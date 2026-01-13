const endpoints = {
    auth: {
        register: "/api/v1/auth/registration/",
        login: "/api/v1/auth/login/",
        refresh: "/api/v1/auth/token/refresh/",
    },
    users: {
        list: "/api/v1/users/",
        detail: (id) => `/api/v1/users/${id}/`,
    },
    modules: {
        list: "/api/v1/modules/",
        detail: (id) => `/api/v1/modules/${id}/`,

        perms: (id) => `/api/v1/modules/${id}/perms/`,
        permsDetail: (id, userId) => `/api/v1/modules/${id}/perms/users/${userId}/`,
        permsUsers: (id) => `/api/v1/modules/${id}/perms/users/`,

        visibles: (id) => `/api/v1/modules/${id}/visibles/`,
        pins: (id) => `/api/v1/modules/${id}/pins/`,
        saves: (id) => `/api/v1/modules/${id}/saves/`,
        rates: (id) => `/api/v1/modules/${id}/rates/`,

        tags: (id) => `/api/v1/modules/${id}/tags/`,
        tagsDetail: (id, tagName) => `/api/v1/modules/${id}/tags/${tagName}/`,

        cards: {
            list: (moduleId) => `/api/v1/modules/${moduleId}/cards/`,
            detail: (moduleId, cardId) => `/api/v1/modules/${moduleId}/cards/${cardId}/`,
            learn: (moduleId, cardId) => `/api/v1/modules/${moduleId}/cards/${cardId}/learns/`,
        }
    },
    folders: {
        list: "/api/v1/folders/",
        detail: (id) => `/api/v1/folders/${id}/`,
        visibles: (id) => `/api/v1/folders/${id}/visibles/`,
        saves: (id) => `/api/v1/folders/${id}/saves/`,
        modules: (id, moduleId) => `/api/v1/folders/${id}/modules/${moduleId}/`
    },
    languages: "/api/v1/languages/",
    topics: {
        list: "/api/v1/topics/",
        detail: (id) => `/api/v1/topics/${id}/`,
    },
};

export default endpoints;