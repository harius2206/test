import "./header.css";
import SearchField from "../searchField/searchField";
import { Link } from "react-router-dom";
import UserMenu from "../userMenu/userMenu";

const Header = () => {
    return (
        <div className="hdr-wrapper">
            <Link to="/" className="hdr-logo">Kussotare</Link>

            <div className="hdr-search-container" style={{ margin: "0 16px" }}>
                <SearchField placeholder="search for anything" width="360px" height="40px" />
            </div>

            <div className="hdr-nav">
                <Link to="/" className="hdr-nav-text">Main</Link>
                <Link to="/library" className="hdr-nav-text">Library</Link>
                <Link to="/folders" className="hdr-nav-text">Folders</Link>
            </div>

            <UserMenu />
        </div>
    );
};

export default Header;
