import "./searchField.css";
import searchIcon from './searchIcon.svg'

export default function SearchField({ placeholder = "search for anything" }) {
    return (
        <div className="search-wrapper">
            <img src={searchIcon} alt="Search" className="search-icon" />
            <input type="text" className="search-input" placeholder={placeholder} />
        </div>
    );
}