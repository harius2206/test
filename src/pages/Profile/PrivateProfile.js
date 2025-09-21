import "./profile.css";
import EditableField from "../../components/editableField/editableField";

export default function PrivateProfile() {
    return (
        <div className="profile-content">
            <h1 className="profile-title">Private profile</h1>
            <h2 className="profile-tile-description">Add some information about you</h2>

            <form className="profile-form">
                <label>
                    username
                    <EditableField value="admin" editable={true} />
                </label>

                <label>
                    first name
                    <EditableField value="SpongeBob" editable={true} />
                </label>

                <label>
                    last name
                    <EditableField value="SquarePants" editable={true} />
                </label>

                <label>
                    description
                    <EditableField
                        value="Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        editable={true}
                        type="textarea"
                    />
                </label>
            </form>
        </div>
    );
}