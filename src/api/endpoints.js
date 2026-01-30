const endpoints = {
    auth: {
        register: "/api/v1/auth/registration/",
        login: "/api/v1/auth/login/",
        refresh: "/api/v1/auth/token/refresh/",
    },
    users: {
        list: "/api/v1/users/",
        detail: (id) => `/api/v1/users/${id}/`,
        ratings: "/api/v1/users/ratings/",
    },
    modules: {
        list: "/api/v1/modules/",
        detail: (id) => `/api/v1/modules/${id}/`,

        perms: (id) => `/api/v1/modules/${id}/perms/`,
        permsDetail: (id, userId) => `/api/v1/modules/${id}/perms/users/${userId}/`,
        permsUsers: (id) => `/api/v1/modules/${id}/perms/users/`,

        visibles: (id) => `/api/v1/modules/${id}/visibles/`,
        pins: (id) => `/api/v1/modules/${id}/pins/`,         // POST/DELETE (toggle)
        pinned: (userId) => `/api/v1/modules/pins/users/${userId}/`, // GET list
        saves: (id) => `/api/v1/modules/${id}/saves/`,
        rates: (id) => `/api/v1/modules/${id}/rates/`,

        merge: "/api/v1/modules/merge/",

        tags: (id) => `/api/v1/modules/${id}/tags/`,
        tagsDetail: (id, tagName) => `/api/v1/modules/${id}/tags/${tagName}/`,

        saved: (userId) => `/api/v1/modules/saves/users/${userId}/`,
    },
    cards: {
        list: "/api/v1/cards/",
        detail: (id) => `/api/v1/cards/${id}/`,
        learn: (id) => `/api/v1/cards/${id}/learns/`,
        saves: (id) => `/api/v1/cards/${id}/saves/`,
        saved: (userId) => `/api/v1/cards/saves/users/${userId}/`,
    },
    folders: {
        list: "/api/v1/folders/",
        detail: (id) => `/api/v1/folders/${id}/`,
        visibles: (id) => `/api/v1/folders/${id}/visibles/`,
        saves: (id) => `/api/v1/folders/${id}/saves/`,
        pins: (id) => `/api/v1/folders/${id}/pins/`,         // POST/DELETE (toggle)
        pinned: (userId) => `/api/v1/folders/pins/users/${userId}/`, // GET list
        modules: (id, moduleId) => `/api/v1/folders/${id}/modules/${moduleId}/`,
        saved: (userId) => `/api/v1/folders/saves/users/${userId}/`,
    },
    languages: "/api/v1/languages/",
    topics: {
        list: "/api/v1/topics/",
        detail: (id) => `/api/v1/topics/${id}/`,
    },
};

export default endpoints;