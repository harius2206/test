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
};

export default endpoints;
