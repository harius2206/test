import "./footer.css"
import language from "./language.svg"

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-left">
                <span className="footer-logo">Kusottare</span>
                <span className="footer-copy">© 2025 kusottarе team</span>
                <span className="footer-divider"></span>
                <nav className="footer-nav">
                    <a href="#">About us</a>
                    <a href="#">Help</a>
                </nav>
            </div>

            <div className="footer-lang">
                <img src={language} alt="language" className="footer-lang-icon" />
                <span>English</span>
            </div>
        </footer>


    );
}