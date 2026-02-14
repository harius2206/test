import React from 'react';
import './languageModal.css';
import { useI18n, availableLanguages } from '../../i18n';
import ClickOutsideWrapper from '../clickOutsideWrapper';

export default function LanguageModal() {
    const { t, setIsLangModalOpen, changeLanguage, language } = useI18n();

    return (
        <div className="lang-modal-overlay">
            <ClickOutsideWrapper onClickOutside={() => setIsLangModalOpen(false)}>
                <div className="lang-modal-content">
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
                                <span className="lang-flag">{lang.flag}</span>
                                <span className="lang-label">{lang.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </ClickOutsideWrapper>
        </div>
    );
}