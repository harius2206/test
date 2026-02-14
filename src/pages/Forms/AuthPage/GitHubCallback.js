import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { githubLogin } from "../../../api/authApi";
import { setTokens, saveUserData } from "../../../utils/storage";
import { useAuth } from "../../../context/AuthContext";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import { useI18n } from "../../../i18n";

export default function GitHubCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const handledRef = useRef(false);
    const { t } = useI18n();

    const [modal, setModal] = useState({
        open: true,
        type: "info",
        message: t("ghProcessing")
    });

    useEffect(() => {
        const code = params.get("code");
        if (!code) {
            setModal({ open: true, type: "error", message: t("ghNoCode") });
            setTimeout(() => navigate("/login"), 1000);
            return;
        }
        if (handledRef.current) return;
        handledRef.current = true;

        githubLogin(code)
            .then((res) => {
                const { access, refresh, user } = res.data;

                if (user?.username && user.username.length > 20) {
                    user.username = user.username.slice(0, 20);
                }

                setTokens(access, refresh);
                saveUserData(user);
                setUser(user);

                setModal({ open: true, type: "success", message: t("ghSuccess") });
                setTimeout(() => navigate("/"), 800);
            })
            .catch((err) => {
                console.error("GitHub login failed:", err);
                setModal({ open: true, type: "error", message: t("ghFailed") });
                setTimeout(() => navigate("/login"), 1200);
            });
    }, [params, navigate, setUser, t]);

    return (
        <ModalMessage
            open={modal.open}
            type={modal.type}
            message={modal.message}
            onClose={() => {
                setModal((m) => ({ ...m, open: false }));
            }}
        />
    );
}
