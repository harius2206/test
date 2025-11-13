// `src/pages/Forms/AuthPage/GitHubCallback.js`
import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { githubLogin } from "../../../api/authApi";
import { saveTokens } from "../../../utils/storage";
import { useAuth } from "../../../context/AuthContext";

export default function GitHubCallback() {
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

        githubLogin(code)
            .then((res) => {
                const { access, refresh, user } = res.data;
                saveTokens(access, refresh);
                setUser(user);
                navigate("/");
            })
            .catch(() => {
                navigate("/login");
            });
    }, [params, navigate, setUser]);

    return <div>Logging in with GitHub...</div>;
}