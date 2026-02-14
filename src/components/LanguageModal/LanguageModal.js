import React from 'react';
import './languageModal.css';
import { useI18n, availableLanguages } from '../../i18n';

export default function LanguageModal() {
    const { t, setIsLangModalOpen, changeLanguage, language } = useI18n();

    // Закриваємо модалку при кліку на оверлей
    const handleOverlayClick = () => setIsLangModalOpen(false);

    // Зупиняємо розповсюдження кліку всередині контенту, щоб він не закривався
    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="lang-modal-overlay" onClick={handleOverlayClick}>
            <div className="lang-modal-content" onClick={handleContentClick}>
                <div className="lang-modal-header">
                    <h3>{t("langModalTitle")}</h3>
                    <button className="lang-close-btn" onClick={() => setIsLangModalOpen(false)}>×</button>
                </div>
                <div className="lang-grid">
                    {availableLanguages.map((lang) => (
                        <div
                            key={lang.code}
                            className={`lang-item ${language === lang.code ? 'active' : ''}`}
                            onClick={() => changeLanguage(lang.code)}
                        >
                            <span className="lang-flag" style={{fontSize: '2rem'}}>{lang.flag}</span>
                            <span className="lang-label">{lang.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}