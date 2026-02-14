import React from "react";
import Button from "../../components/button/button";
import { useI18n } from "../../i18n";
import "./profile.css";

export default function DeleteAccount() {
    const { t } = useI18n();

    return (
        <div className="profile-content">
            <h1 className="profile-title">{t("daDeleteAccountTitle")}</h1>
            <h2 className="profile-tile-description">{t("daDeleteAccountSubtitle")}</h2>

            <div className="profile-form">
                <p className="attention">
                    {t("daAttentionText")}
                </p>
                <p className="attention-description">
                    {t("daAttentionDescription")}
                </p>

                <Button
                    variant="toggle"
                    color="#DF4C4C"
                    width="170px"
                    height="46px"
                >
                    {t("daDeleteAccountBtn")}
                </Button>
            </div>
        </div>
    );
}