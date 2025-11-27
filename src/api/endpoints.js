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
        rate: (id) => `/api/v1/modules/${id}/rate/`,
        cards: {
            list: (module_pk) => `/api/v1/modules/${module_pk}/cards/`,
            detail: (module_pk, id) => `/api/v1/modules/${module_pk}/cards/${id}/`,
            learn: (module_pk, id) => `/api/v1/modules/${module_pk}/cards/${id}/learns/`,
        }
    },
    languages: "/api/v1/languages/",
    topics: {
        list: "/api/v1/topics/",
        detail: (id) => `/api/v1/topics/${id}/`,
    },
};

export default endpoints;