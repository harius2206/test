import Profile from "../pages/Profile/Profile";
import MainPage from "../pages/MainPage/MainPage";
import LibraryPage from "../pages/Library/Library";
import CreateModule from "../pages/Library/CreateModule/CreateModule";
import ModuleView from "../pages/Library/ModuleView/ModuleView";
import CardsTest from "../pages/Library/CardTest/CardsTest";
import CardsCheck from "../pages/Library/CardsCheck/CardsCheck";
import FolderInfo from "../pages/Library/FolderInfo/FolderInfo";
import PublicProfileLibrary from "../pages/Profile/PublicProfileLibrary/PublicProfileLibrary";
import Saves from "../pages/Library/Saves/Saves";
import RegisterPage from "../pages/Forms/AuthPage/RegisterPage";
import LoginPage from "../pages/Forms/AuthPage/LoginPage";
import PasswordReset from "../pages/Forms/AuthPage/PasswordReset";
import GitHubCallback from "../pages/Forms/AuthPage/GitHubCallback";
import GoogleCallback from "../pages/Forms/AuthPage/GoogleCallBack";
import TestPage from "../pages/TestPage";

const appRoutes = [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/password-reset", component: PasswordReset },
    { path: "/github/callback", component: GitHubCallback },
    { path: "/google/callback", component: GoogleCallback },

    { path: "/profile/public/:id", component: PublicProfileLibrary },

    { path: "/", component: MainPage, protected: true },

    { path: "/library/create-module", component: CreateModule, protected: true },
    { path: "/library/create-folder", component: CreateModule, protected: true },
    { path: "/library/module-view", component: ModuleView, protected: true },
    { path: "/library/cards-check", component: CardsCheck, protected: true },
    { path: "/library/cards-test", component: CardsTest, protected: true },
    { path: "/library/folders/:id", component: FolderInfo, protected: true },

    { path: "/library/*", component: LibraryPage, protected: true },

    { path: "/profile/*", component: Profile, protected: true },

    { path: "/saves", component: Saves, protected: true },

    { path: "/test", component: TestPage, protected: true },
];


export default appRoutes;