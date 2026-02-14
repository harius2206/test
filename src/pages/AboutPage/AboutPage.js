import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import "./aboutPage.css";

const AboutPage = () => {
    const { theme } = useContext(ThemeContext);

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
                <h1>Про проєкт</h1>
                <p className="subtitle">Дипломна робота студентів ВТФК</p>
                <p className="group-info">Група: 4КІ-21</p>
            </section>

            <section className="about-team">
                <div className="team-member">
                    <div className="photo-placeholder">
                        <span>Фото розробника<br/>Войцех Євгеній</span>
                    </div>
                    <h3>Войцех Євгеній</h3>
                    <p className="role">Розробник</p>
                </div>

                <div className="team-member">
                    <div className="photo-placeholder">
                        <span>Фото розробника<br/>Чемін Дмитро</span>
                    </div>
                    <h3>Чемін Дмитро</h3>
                    <p className="role">Розробник</p>
                </div>
            </section>

            <section className="tech-stack">
                <div className="tech-card front">
                    <h2>Frontend Stack</h2>
                    <ul>
                        {frontendTech.map((tech, index) => (
                            <li key={index}>{tech}</li>
                        ))}
                    </ul>
                </div>

                <div className="tech-card back">
                    <h2>Backend Stack</h2>
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