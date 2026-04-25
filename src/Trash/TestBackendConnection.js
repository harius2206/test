import React, { useEffect } from "react";
import { getUsers } from "../api/usersApi";

export default function TestBackendConnection() {
    useEffect(() => {
        (async () => {
            try {
                console.log("[TEST] Fetching users from:", process.env.REACT_APP_API_URL + "/api/v1/users/");
                const resp = await getUsers();
                console.log("[TEST] Users response:", resp.status, resp.data);
            } catch (err) {
                console.error("[TEST] Failed to load users:", err?.response?.status, err?.message);
            }
        })();
    }, []);

    return null;
}
