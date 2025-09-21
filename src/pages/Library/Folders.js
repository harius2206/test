import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

export default function FoldersPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>Folders Page</h1>
            </div>
            <Footer />
        </div>
    );
}