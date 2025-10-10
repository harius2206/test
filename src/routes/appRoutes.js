import Profile from "../pages/Profile/Profile";
import MainPage from "../pages/MainPage";
import LibraryPage from "../pages/Library/Library";
import CreateModule from "../pages/Library/CreateModule/CreateModule";
import ModuleView from "../pages/Library/ModuleView/ModuleView";
import CardsTest from "../pages/Library/CardTest/CardsTest";
import CardsCheck from "../pages/Library/CardsCheck/CardsCheck";

const appRoutes = [
    { path: "/", component: MainPage },
    { path: "/library/*", component: LibraryPage },
    { path: "/profile/*", component: Profile },
    { path: "/library/create-module", component: CreateModule, exact: true },
    { path: "/library/module-view", component: ModuleView, exact: true },
    { path: "/cardscheck", component: CardsCheck, exact: true },
    { path: "/cardstest", component: CardsTest, exact: true },


];

export default appRoutes;