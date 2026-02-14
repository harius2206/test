import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { useNavigate } from "react-router-dom";

// API
import { verifyNewEmail } from "../../api/authApi";
import { getModules } from "../../api/modulesApi";
import { getUserDetails, getUsersRatings } from "../../api/usersApi";

// Utils & Context
import { useError } from "../../context/ErrorContext";
import { useAuth } from "../../context/AuthContext";
import { getUserData, savePendingEmail, saveUserData } from "../../utils/storage";
import { useI18n } from "../../i18n";

// Components & Icons
import { ReactComponent as ArrowLeft } from "../../images/arrowLeft.svg";
import { ReactComponent as ArrowRight } from "../../images/arrowRight.svg";
import { ReactComponent as StarIcon } from "../../images/star.svg";
import { ReactComponent as FolderIcon } from "../../images/folder.svg";
import ColoredIcon from "../../components/coloredIcon";
import UserAvatar from "../../components/avatar/avatar";
import DiagonalFlagRect from "../../components/diagonalFlagRect43";
import Loader from "../../components/loader/loader";

import "./mainPage.css";

const getFlagUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

export default function MainPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showMessage, showError } = useError();
    const { t } = useI18n();

    const [mpLatestViewed, mpSetLatestViewed] = useState([]);
    const [mpPopularModules, mpSetPopularModules] = useState([]);
    const [mpBestAuthors, mpSetBestAuthors] = useState([]);
    const [mpLoading, mpSetLoading] = useState(true);

    // Email Verification Logic
    useEffect(() => {
        if (window.__emailVerifyDone) return;
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");
        if (!key) return;

        window.__emailVerifyDone = true;

        (async () => {
            try {
                const res = await verifyNewEmail(key);
                const email = res?.data?.email || res?.email || null;
                if (email) {
                    savePendingEmail(email);
                    const userData = getUserData();
                    if (userData) {
                        const updatedUser = { ...userData, email };
                        saveUserData(updatedUser);
                    }
                }
                showMessage(t("mpEmailVerifiedSuccess"), "success");
                setTimeout(() => { navigate("/"); }, 50);
            } catch (err) {
                console.error("verifyNewEmail failed:", err);
                showError(t("mpEmailVerificationError"));
            }
        })();
    }, [navigate, showMessage, showError, t]);

    // Data Fetching Logic
    useEffect(() => {
        const fetchData = async () => {
            try {
                mpSetLoading(true);

                // A. Latest Viewed
                let myRecent = [];
                if (user?.id) {
                    const userDetails = await getUserDetails(user.id);
                    const modules = (userDetails.data.modules || []).map(m => ({ ...m, type: 'module' }));
                    const folders = (userDetails.data.folders || []).map(f => ({ ...f, type: 'folder' }));

                    const mixed = [...modules, ...folders].sort((a, b) => b.id - a.id);
                    myRecent = mixed.slice(0, 10);
                }
                mpSetLatestViewed(myRecent);

                // B. Popular Modules
                const modulesResp = await getModules();
                const allModules = modulesResp.data.results || modulesResp.data || [];
                const popular = allModules
                    .filter(m => {
                        const isHighRated = m.avg_rate && parseFloat(m.avg_rate) >= 4.3;
                        const isNotMine = user ? String(typeof m.user === 'object' ? m.user.id : m.user) !== String(user.id) : true;
                        return isHighRated && isNotMine;
                    })
                    .sort((a, b) => parseFloat(b.avg_rate) - parseFloat(a.avg_rate))
                    .slice(0, 10);
                mpSetPopularModules(popular);

                // C. Best Authors
                const authorsResp = await getUsersRatings();
                const authors = authorsResp.data.results || authorsResp.data || [];
                const filteredAuthors = authors.filter(a => String(a.id) !== String(user?.id));

                mpSetBestAuthors(filteredAuthors.slice(0, 100));

            } catch (error) {
                console.error("Failed to load main page data:", error);
            } finally {
                mpSetLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const commonBreakpoints = {
        0: { slidesPerView: 1 },
        520: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1000: { slidesPerView: 4 },
    };

    if (mpLoading && mpLatestViewed.length === 0 && mpPopularModules.length === 0) {
        return <Loader fullscreen />;
    }

    return (
        <div className="mp-wrapper">

            {/* --- LATEST VIEWED --- */}
            <section className="mp-section">
                <h2 className="mp-title">{t("mpLatestViewed")}</h2>
                {mpLatestViewed.length === 0 ? (
                    <div className="mp-empty">{t("mpLatestEmpty")}</div>
                ) : (
                    <div className="mp-slider-wrapper">
                        <div className="mp-slider-frame">
                            <button className="mp-arrow-btn mp-arrow-left prev-latest">
                                <ArrowLeft />
                            </button>

                            <Swiper
                                key="latest-swiper"
                                modules={[Navigation, Autoplay]}
                                loop={mpLatestViewed.length > 4}
                                autoplay={{ delay: 3000, disableOnInteraction: false }}
                                navigation={{ prevEl: ".prev-latest", nextEl: ".next-latest" }}
                                observer={true}
                                observeParents={true}
                                spaceBetween={16}
                                breakpoints={commonBreakpoints}
                            >
                                {mpLatestViewed.map((item) => {
                                    const isFolder = item.type === 'folder';
                                    const itemUserId = typeof item.user === 'object' ? item.user?.id : item.user;
                                    const isMyItem = String(itemUserId) === String(user?.id);
                                    const authorName = typeof item.user === 'object' ? item.user?.username : "User";
                                    const topicName = item.topic?.name || (typeof item.topic === 'string' ? item.topic : "");
                                    const countText = isFolder
                                        ? `${item.modules_count || 0} ${t("mpModules")}`
                                        : `${item.cards_count || (item.cards ? item.cards.length : 0)} ${t("mpTerms")}`;

                                    const handleClick = () => {
                                        if (isFolder) {
                                            navigate(`/library/folders/${item.id}`);
                                        } else {
                                            navigate(`/library/module-view?id=${item.id}`);
                                        }
                                    };

                                    return (
                                        <SwiperSlide key={`${item.type}-${item.id}`}>
                                            <div className="mp-folder-card" onClick={handleClick}>
                                                <div className="mp-folder-header">
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                                        {isFolder && <ColoredIcon icon={FolderIcon} color={item.color || "#6366f1"} size={16} />}
                                                        <span className="mp-folder-count">{countText}</span>
                                                    </div>
                                                    <span className="mp-folder-name" title={item.name}>{item.name}</span>
                                                </div>
                                                <div className="mp-folder-meta">
                                                    {!isFolder && topicName && <span className="mp-folder-topic">{topicName}</span>}
                                                    {!isMyItem && <span>{t("mpBy")} {authorName}</span>}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <button className="mp-arrow-btn mp-arrow-right next-latest">
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* --- POPULAR MODULES --- */}
            <section className="mp-section">
                <h2 className="mp-title">{t("mpPopularModules")}</h2>
                {mpPopularModules.length === 0 ? (
                    <div className="mp-empty">{t("mpPopularEmpty")}</div>
                ) : (
                    <div className="mp-slider-wrapper">
                        <div className="mp-slider-frame">
                            <button className="mp-arrow-btn mp-arrow-left prev-mod">
                                <ArrowLeft />
                            </button>

                            <Swiper
                                key="modules-swiper"
                                modules={[Navigation, Autoplay]}
                                loop={mpPopularModules.length > 4}
                                autoplay={{ delay: 3500, disableOnInteraction: false }}
                                navigation={{ prevEl: ".prev-mod", nextEl: ".next-mod" }}
                                observer={true}
                                observeParents={true}
                                spaceBetween={16}
                                breakpoints={commonBreakpoints}
                            >
                                {mpPopularModules.map((m) => {
                                    const flag1 = getFlagUrl(m.lang_from?.flag);
                                    const flag2 = getFlagUrl(m.lang_to?.flag);
                                    const rating = m.avg_rate ? parseFloat(m.avg_rate).toFixed(1) : "0.0";
                                    const words = m.cards_count || (m.cards ? m.cards.length : 0);
                                    const authorName = m.user?.username || "Unknown";
                                    const description = m.description || t("mpNoDescription");

                                    return (
                                        <SwiperSlide key={m.id}>
                                            <div className="mp-module-card" onClick={() => navigate(`/library/module-view?id=${m.id}`)}>
                                                <div className="mp-card-header">
                                                    <div className="mp-module-top">
                                                        <h4 className="mp-module-name" title={m.name}>{m.name}</h4>
                                                        {(flag1 || flag2) && (
                                                            <DiagonalFlagRect flag1={flag1} flag2={flag2} width={20} height={15} />
                                                        )}
                                                    </div>
                                                    <div className="mp-rating">
                                                        {rating}
                                                        <StarIcon className="mp-star" />
                                                    </div>
                                                </div>
                                                <p className="mp-module-desc">{description}</p>
                                                <div className="mp-card-bottom">
                                                    <span>{words} {t("mpWords")}</span>
                                                    <div className="mp-bottom-divider" />
                                                    <span className="mp-author-text" title={authorName}>{authorName}</span>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <button className="mp-arrow-btn mp-arrow-right next-mod">
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* --- BEST AUTHORS --- */}
            <section className="mp-section">
                <h2 className="mp-title">{t("mpBestAuthors")}</h2>
                {mpBestAuthors.length === 0 ? (
                    <div className="mp-empty">{t("mpAuthorsEmpty")}</div>
                ) : (
                    <div className="mp-slider-wrapper">
                        <div className="mp-slider-frame">
                            <button className="mp-arrow-btn mp-arrow-left prev-auth">
                                <ArrowLeft />
                            </button>

                            <Swiper
                                key="authors-swiper"
                                modules={[Navigation, Autoplay]}
                                loop={mpBestAuthors.length > 4}
                                autoplay={{ delay: 3200, disableOnInteraction: false }}
                                navigation={{ prevEl: ".prev-auth", nextEl: ".next-auth" }}
                                observer={true}
                                observeParents={true}
                                spaceBetween={16}
                                breakpoints={commonBreakpoints}
                            >
                                {mpBestAuthors.map((a) => (
                                    <SwiperSlide key={a.id}>
                                        <div className="mp-author-card" onClick={() => navigate(`/profile/public/${a.id}`)}>
                                            <UserAvatar
                                                name={a.username}
                                                size={50}
                                                src={getFlagUrl(a.avatar)}
                                                disableStrictFallback={true}
                                            />
                                            <div className="mp-author-info">
                                                <span className="mp-author-name" title={a.username}>{a.username}</span>
                                                <div className="mp-author-rating">
                                                    <StarIcon className="mp-star" />
                                                    <span>{a.avg_rate ? parseFloat(a.avg_rate).toFixed(1) : "0.0"}</span>
                                                </div>
                                                <div className="mp-author-modules">
                                                    {a.public_modules_count || 0} {t("mpModulesShort")}
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <button className="mp-arrow-btn mp-arrow-right next-auth">
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}