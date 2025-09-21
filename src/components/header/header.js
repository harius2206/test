import "./header.css"
import userImage from './userImage.jpg'
import SearchField from "../searchField/searchField";
import { Link } from "react-router-dom";

const Header = () => {
    return(
        <div className={"header-wrapper"}>
            <div className={"logo"}>Kussotare</div>
            <SearchField placeholder="search for anything" />
            <div className={"nav-wrapper"}>
                <Link to="/" className="nav-text">Main</Link>
                <Link to="/library" className="nav-text">Library</Link>
                <Link to="/folders" className="nav-text">Folders</Link>
            </div>
            <img src={userImage} alt="user" className={"user-image"}/>
        </div>
    )
}

export default Header;
