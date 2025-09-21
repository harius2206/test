import Profile from "../pages/Profile/Profile";

import MainPage from "../pages/MainPage";
import LibraryPage from "../pages/Library/Library";
import FoldersPage from "../pages/Library/Folders";

const appRoutes = [
    { path: "/", component: MainPage },
    { path: "/library", component: LibraryPage },
    { path: "/folders", component: FoldersPage },
    { path: "/profile/*", component: Profile },
];

export default appRoutes;