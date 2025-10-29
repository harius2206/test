import Profile from "../pages/Profile/Profile";
import MainPage from "../pages/MainPage/MainPage";
import LibraryPage from "../pages/Library/Library";
import CreateModule from "../pages/Library/CreateModule/CreateModule";
import ModuleView from "../pages/Library/ModuleView/ModuleView";
import CardsTest from "../pages/Library/CardTest/CardsTest";
import CardsCheck from "../pages/Library/CardsCheck/CardsCheck";
import PublicProfileLibrary from "../pages/Profile/PublicProfileLibrary/PublicProfileLibrary";
import Saves from "../pages/Library/Saves/Saves";


const appRoutes = [
    { path: "/", component: MainPage },
    { path: "/library/*", component: LibraryPage },
    { path: "/profile/public-library", component: PublicProfileLibrary },
    { path: "/profile/*", component: Profile },
    { path: "/library/create-module", component: CreateModule, exact: true },
    { path: "/library/module-view", component: ModuleView, exact: true },
    { path: "/cardscheck", component: CardsCheck, exact: true },
    { path: "/cardstest", component: CardsTest, exact: true },
    { path: "/saves", component: Saves }

];

export default appRoutes;