import Profile from "../pages/Profile/Profile";
import MainPage from "../pages/MainPage/MainPage";
import LibraryPage from "../pages/Library/Library";
import CreateModule from "../pages/Library/CreateModule/CreateModule";
import ModuleView from "../pages/Library/ModuleView/ModuleView";
import CardsTest from "../pages/Library/CardTest/CardsTest";
import CardsCheck from "../pages/Library/CardsCheck/CardsCheck";
import PublicProfileLibrary from "../pages/Profile/PublicProfileLibrary/PublicProfileLibrary";
import Saves from "../pages/Library/Saves/Saves";
import RegisterPage from "../pages/Forms/AuthPage/RegisterPage";
import LoginPage from "../pages/Forms/AuthPage/LoginPage";
import PasswordReset from "../pages/Forms/AuthPage/PasswordReset";
import GitHubCallback from "../pages/Forms/AuthPage/GitHubCallback";
import GoogleCallback from "../pages/Forms/AuthPage/GoogleCallBack";
import AboutPage from "../pages/AboutPage/AboutPage";

const appRoutes = [
    { path: "/", component: MainPage },
    { path: "/library/*", component: LibraryPage },

    { path: "/profile/public/:id", component: PublicProfileLibrary },
    { path: "/profile/*", component: Profile, protected: true },

    { path: "/library/create-module", component: CreateModule, exact: true, protected: true },
    { path: "/saves", component: Saves, protected: true },

    { path: "/library/module-view", component: ModuleView, exact: true },
    { path: "/cardscheck", component: CardsCheck, exact: true },
    { path: "/cardstest", component: CardsTest, exact: true },

    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/reset-password", component: PasswordReset },
    { path: "/github/callback", component: GitHubCallback },
    { path: "/google/callback", component: GoogleCallback },

    { path: "/about", component: AboutPage, protected: false },
];

export default appRoutes;