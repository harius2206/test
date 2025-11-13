import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { googleLogin } from "../../../api/authApi";
import { setTokens, saveUserData } from "../../../utils/storage";
import { useAuth } from "../../../context/AuthContext";

export default function GoogleCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const handledRef = useRef(false);

    useEffect(() => {
        const code = params.get("code");
        if (!code) {
            navigate("/login");
            return;
        }

        if (handledRef.current) return;
        handledRef.current = true;

        googleLogin(code)
            .then((res) => {
                const { access, refresh, user } = res.data;
                setTokens(access, refresh);
                saveUserData(user);
                setUser(user);
                navigate("/");
            })
            .catch(() => {
                navigate("/login");
            });
    }, [params, navigate, setUser]);

    return <div>Logging in with Google...</div>;
}
