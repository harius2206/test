import axiosNoAuth from "./axiosNoAuth";
import axiosClient from "./axiosClient";
import endpoints from "./endpoints";

export const registerUser = (data) =>
    axiosNoAuth.post(endpoints.auth.register, data);

export const verifyEmail = (key) =>
    axiosNoAuth.post("/api/v1/auth/registration/verify-email/", { key });

export const githubLogin = (code) =>
    axiosNoAuth.post("/api/v1/auth/login/github/callback/", { code });

export const googleLogin = (code) =>
    axiosNoAuth.post("/api/v1/auth/login/google/callback/", { code });

export const requestEmailChange = (new_email) =>
    axiosClient.post("/api/v1/auth/email/change/", { new_email });

export const verifyNewEmail = (key) =>
    axiosClient.post("/api/v1/auth/email/verify/", { key });

export const loginUser = (data) => {
    const payload = {
        username: data.username,
        email: data.email || "",
        password: data.password,
    };
    return axiosNoAuth.post(endpoints.auth.login, payload);
};

export const fetchCurrentUser = () => {
    return axiosClient.get("/api/v1/auth/user/");
};

/**
 * updateUser:
 * - If payload is FormData (contains file), send as multipart/form-data.
 * - Otherwise send JSON PATCH (partial update).
 *
 * Example usages:
 * updateUser({ username: 'newname' })
 * updateUser(formData) // formData.append('avatar', file)
 */
export const updateUser = (payload) => {
    if (payload instanceof FormData) {
        return axiosClient.patch("/api/v1/auth/user/", payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    } else {
        return axiosClient.patch("/api/v1/auth/user/", payload);
    }
};

/* Password change endpoint */
export const changePassword = ({ old_password, new_password1, new_password2 }) => {
    return axiosClient.post("/api/v1/auth/password/change/", {
        old_password,
        new_password1,
        new_password2,
    });
};
