import { Link } from "react-router-dom";
import SearchField from "../searchField/searchField";
import UserMenu from "../userMenu/userMenu";
import "./header.css";
import { useI18n } from "../../i18n";

const Header = () => {
    const { t } = useI18n();

    return (
        <header className="hdr-wrapper">
            <div className="hdr-left">
                <Link to="/" className="hdr-logo">Kussotare</Link>

                <div className="hdr-search-container">
                    <SearchField placeholder={t("hdrSearchPlaceholder_label")} width="320px" height="40px" />
                </div>
            </div>

            <div className="hdr-right">
                <nav className="hdr-nav">
                    <Link to="/" className="hdr-nav-text">{t("hdrNavMain_label")}</Link>
                    <Link to="/library" className="hdr-nav-text">{t("hdrNavLibrary_label")}</Link>
                    <Link to="/saves" className="hdr-nav-text">{t("hdrNavSaved_label")}</Link>
                </nav>

                <div className="hdr-user">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
