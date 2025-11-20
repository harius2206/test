import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Захищає маршрути, що вимагають авторизації.
 * Якщо користувач не автентифікований, перенаправляє його на сторінку входу.
 */
const AuthGuard = ({ component: Component, ...rest }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate
            to="/login"
            state={{ from: location }}
            replace
        />;
    }

    return <Component {...rest} />;
};

export default AuthGuard;