import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useI18n } from "../../i18n";
import "./aboutPage.css";

const AboutPage = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useI18n();

    const frontendTech = [
        "React 19",
        "React Router Dom",
        "Axios",
        "Material UI",
        "Flowbite React",
        "Swiper API",
        "Emotion Styled Components"
    ];

    const backendTech = [
        "Node.js / Express (Теоретично)",
        "PostgreSQL / MongoDB (Теоретично)",
        "JWT Authentication",
        "REST API Design",
        "CORS & Security Middleware"
    ];

    return (
        <div className={`about-container ${theme}`}>
            <section className="about-header">
                <h1>{t("aboutHeader_title")}</h1>
                <p className="subtitle">{t("aboutHeader_subtitle")}</p>
                <p className="group-info">{t("aboutHeader_group")}</p>
            </section>

            <section className="about-team">
                <div className="team-member">
                    <div className="photo-placeholder">
                        <span>{t("teamMember1_photo")}<br/>{t("teamMember1_name")}</span>
                    </div>
                    <h3>{t("teamMember1_name")}</h3>
                    <p className="role">{t("teamMember_role")}</p>
                </div>

                <div className="team-member">
                    <div className="photo-placeholder">
                        <span>{t("teamMember2_photo")}<br/>{t("teamMember2_name")}</span>
                    </div>
                    <h3>{t("teamMember2_name")}</h3>
                    <p className="role">{t("teamMember_role")}</p>
                </div>
            </section>

            <section className="tech-stack">
                <div className="tech-card front">
                    <h2>{t("techStack_frontend")}</h2>
                    <ul>
                        {frontendTech.map((tech, index) => (
                            <li key={index}>{tech}</li>
                        ))}
                    </ul>
                </div>

                <div className="tech-card back">
                    <h2>{t("techStack_backend")}</h2>
                    <ul>
                        {backendTech.map((tech, index) => (
                            <li key={index}>{tech}</li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
