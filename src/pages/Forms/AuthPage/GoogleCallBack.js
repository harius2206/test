import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { googleLogin } from "../../../api/authApi";
import { setTokens, saveUserData } from "../../../utils/storage";
import { useAuth } from "../../../context/AuthContext";
import ModalMessage from "../../../components/ModalMessage/ModalMessage";
import { useI18n } from "../../../i18n";

export default function GoogleCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const handledRef = useRef(false);
    const { t } = useI18n();

    const [modal, setModal] = useState({
        open: true,
        type: "info",
        message: t("googleProcessing")
    });

    useEffect(() => {
        const code = params.get("code");
        if (!code) {
            setModal({ open: true, type: "error", message: t("googleNoCode") });
            setTimeout(() => navigate("/login"), 1000);
            return;
        }
        if (handledRef.current) return;
        handledRef.current = true;

        googleLogin(code)
            .then((res) => {
                const { access, refresh, user } = res.data;

                if (user?.username && user.username.length > 20) {
                    user.username = user.username.slice(0, 20);
                }

                setTokens(access, refresh);
                saveUserData(user);
                setUser(user);

                setModal({ open: true, type: "success", message: t("googleSuccess") });
                setTimeout(() => navigate("/"), 800);
            })
            .catch((err) => {
                console.error("Google login failed:", err);
                setModal({ open: true, type: "error", message: t("googleFailed") });
                setTimeout(() => navigate("/login"), 1200);
            });
    }, [params, navigate, setUser, t]);

    return (
        <ModalMessage
            open={modal.open}
            type={modal.type}
            message={modal.message}
            onClose={() => setModal((m) => ({ ...m, open: false }))}
        />
    );
}
