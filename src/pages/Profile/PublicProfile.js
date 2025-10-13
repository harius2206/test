import { useNavigate } from "react-router-dom";

export default function PublicProfile() {
    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => navigate("/public/1")} className="btn btn-hover">
                View public library
            </button>
        </div>
    );
}
