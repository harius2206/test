import "./footer.css"
import languageIcon from "./language.svg"
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n";

export default function Footer() {
    const { t, setIsLangModalOpen } = useI18n();

    return (
        <div className="footer-wrapper">
            <footer className="footer">
                <div className="footer-left">
                    <span className="footer-logo">Kusottare</span>
                    <span className="footer-copy">{t("footerCopy_label")}</span>
                    <span className="footer-divider"></span>
                    <nav className="footer-nav">
                        <Link to="/about">{t("footerAbout_label")}</Link>
                        <a href="#">{t("footerHelp_label")}</a>
                    </nav>
                </div>

                <div
                    className="footer-lang"
                    onClick={() => setIsLangModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <img src={languageIcon} alt="language" className="footer-lang-icon" />
                    <span>{t("footerLanguage_label")}</span>
                </div>
            </footer>
        </div>
    );
}