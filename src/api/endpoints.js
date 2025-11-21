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
    },
    languages: "/api/v1/languages/",
    topics: {
        list: "/api/v1/topics/",
        detail: (id) => `/api/v1/topics/${id}/`,
    },
};

export default endpoints;