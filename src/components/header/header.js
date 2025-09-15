import "./header.css"
import userImage from './userImage.jpg'
import SearchField from "../searchField/searchField";

const Header = () => {
    return(
        <div className={"header-wrapper"}>
            <div className={"logo"}>Kussotare</div>
            <SearchField placeholder="search for anything" />
            <div className={"nav-wrapper"}>
                <div className={"nav-text"}>Main</div>
                <div className={"nav-text"}>Library</div>
                <div className={"nav-text"}>Folders</div>
            </div>
            <img src={userImage} alt={userImage} className={"user-image"}/>
        </div>
    )
}

export default Header