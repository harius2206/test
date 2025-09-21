import PrivateProfile from "../pages/Profile/PrivateProfile";
import PublicProfile from "../pages/Profile/PublicProfile";
import ChangePhoto from "../pages/Profile/ChangePhoto";
import Safety from "../pages/Profile/Safety";
import DeleteAccount from "../pages/Profile/DeleteAccount";

const profileRoutes = [
    { path: "private", component: PrivateProfile },
    { path: "public", component: PublicProfile },
    { path: "change-photo", component: ChangePhoto },
    { path: "safety", component: Safety },
    { path: "delete", component: DeleteAccount },
];

export default profileRoutes;