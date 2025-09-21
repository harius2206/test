import Header from "../components/header/header";
import Footer from "../components/footer/footer";

export default function MainPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>Main Page</h1>
            </div>
            <Footer />
        </div>
    );
}