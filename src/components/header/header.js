import { Link } from "react-router-dom";
import SearchField from "../searchField/searchField";
import UserMenu from "../userMenu/userMenu";
import "./header.css";

const Header = () => {
    return (
        <header className="hdr-wrapper">
            <div className="hdr-left">
                <Link to="/" className="hdr-logo">Kussotare</Link>

                <div className="hdr-search-container">
                    <SearchField placeholder="search for anything" width="320px" height="40px" />
                </div>
            </div>

            <div className="hdr-right">
                <nav className="hdr-nav">
                    <Link to="/" className="hdr-nav-text">Main</Link>
                    <Link to="/library" className="hdr-nav-text">Library</Link>
                    <Link to="/saves" className="hdr-nav-text">Saved</Link>

                </nav>

                <div className="hdr-user">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
