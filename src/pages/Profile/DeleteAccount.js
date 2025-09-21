import Button from "../../components/button/button";
import "./profile.css";

export default function DeleteAccount() {
    return (
        <div className="profile-content">
            <h1 className={"profile-title"}>Delete account</h1>
            <h2 className={"profile-tile-description"}>Permanent deleting of account</h2>

            <div className={"profile-form"}>
                <p className={"attention"}>
                    Attention!
                </p>
                <p className={"attention-description"}>
                    If you close your account you will permanently lose access to your account
                    and the data associated with it, even if you decide to create a new account
                    using the same email address in the future.
                </p>

                <Button
                    variant="toggle"
                    color="#DF4C4C"
                    width="170px"
                    height="46px"
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
