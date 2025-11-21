import React, {useEffect, useRef} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { useNavigate } from "react-router-dom";

import { verifyNewEmail } from "../../api/authApi";
import { ReactComponent as ArrowLeft } from "../../images/arrowLeft.svg";
import { ReactComponent as ArrowRight } from "../../images/arrowRight.svg";
import { ReactComponent as StarIcon } from "../../images/star.svg";
import UserAvatar from "../../components/avatar/avatar";
import DiagonalFlagRect from "../../components/diagonalFlagRect43";

import ua from "../../images/flags/ua.svg";
import us from "../../images/flags/us.svg";
import fr from "../../images/flags/fr.svg";
import de from "../../images/flags/de.svg";
import jp from "../../images/flags/jp.svg";

import { useError } from "../../context/ErrorContext";

import "./mainPage.css";
import {getUserData, savePendingEmail, saveUserData} from "../../utils/storage";

export default function MainPage() {
    const latest = [];
    const { showMessage, showError } = useError();
    const navigate = useNavigate();


    const modules = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        name: `Module ${i + 1}`,
        rating: (Math.random() * 2 + 3).toFixed(1),
        words: 100 + i * 20,
        author: `User${i + 1}`,
        description: "Short module description text to show consistency.",
    }));

    const authors = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        name: `Author ${i + 1}`,
        rating: (Math.random() * 2 + 3).toFixed(1),
        modules: 10 + i,
        avatar: "",
    }));

    const flags = [ua, us, fr, de, jp];

    useEffect(() => {
        if (window.__emailVerifyDone) return;

        const params = new URLSearchParams(window.location.search);
        const key = params.get("key");
        if (!key) return;

        window.__emailVerifyDone = true;

        (async () => {
            try {
                const res = await verifyNewEmail(key);

                const email =
                    res?.data?.email ||
                    res?.email ||
                    null;

                console.log("Email from verifyNewEmail:", email, "raw response:", res);

                if (email) {
                    savePendingEmail(email);

                    const user = getUserData();
                    if (user) {
                        const updatedUser = { ...user, email };
                        saveUserData(updatedUser);
                    }
                }

                showMessage("Email successfully verified!", "success");

                setTimeout(() => {
                    navigate("/");
                }, 50);
            } catch (err) {
                console.error("verifyNewEmail failed:", err);
                showError("Email verification failed.");
            }
        })();
    }, [navigate, showMessage, showError]);



    return (
        <div className="mp-wrapper">
            {/* LATEST VIEWED */}
            <section className="mp-section">
                <h2 className="mp-title">Latest viewed</h2>
                {latest.length === 0 ? (
                    <div className="mp-empty">You haven’t watched anything yet</div>
                ) : (
                    <div className="mp-latest-grid">
                        {latest.map((item) => (
                            <div key={item.id} className="mp-folder-card">
                                <span className="mp-folder-count">{item.terms} terms</span>
                                <span className="mp-folder-name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* POPULAR MODULES */}
            <section className="mp-section">
                <h2 className="mp-title">Popular modules</h2>
                <div className="mp-slider-wrapper">
                    <div className="mp-slider-frame">
                        <button className="mp-arrow-btn mp-arrow-left prev-mod">
                            <ArrowLeft />
                        </button>

                        <Swiper
                            key="modules-swiper"
                            modules={[Navigation, Autoplay]}
                            loop={true}
                            autoplay={{ delay: 2800, disableOnInteraction: false }}
                            navigation={{ prevEl: ".prev-mod", nextEl: ".next-mod" }}
                            observer={true}
                            observeParents={true}
                            breakpoints={{
                                0: { slidesPerView: 1, spaceBetween: 8 },
                                500: { slidesPerView: 2, spaceBetween: 12 },
                                700: { slidesPerView: 3, spaceBetween: 16 },
                                900: { slidesPerView: 4, spaceBetween: 18 },
                            }}
                        >
                            {modules.map((m) => {
                                const flag1 = flags[m.id % flags.length];
                                const flag2 = flags[(m.id + 1) % flags.length];
                                return (
                                    <SwiperSlide key={m.id}>
                                        <div className="mp-module-card">
                                            <div className="mp-card-header">
                                                <div className="mp-module-top">
                                                    <h4 className="mp-module-name">{m.name}</h4>
                                                    <DiagonalFlagRect
                                                        flag1={flag1}
                                                        flag2={flag2}
                                                        width={20}
                                                        height={15}
                                                    />
                                                </div>
                                                <div className="mp-rating">
                                                    {m.rating}
                                                    <StarIcon className="mp-star" />
                                                </div>
                                            </div>
                                            <p className="mp-module-desc">{m.description}</p>
                                            <div className="mp-card-bottom">
                                                <span>{m.words} words</span>
                                                <div className="mp-bottom-divider" />
                                                <span>{m.author}</span>
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
            </section>

            {/* BEST AUTHORS */}
            <section className="mp-section">
                <h2 className="mp-title">Best authors</h2>
                <div className="mp-slider-wrapper">
                    <div className="mp-slider-frame">
                        <button className="mp-arrow-btn mp-arrow-left prev-auth">
                            <ArrowLeft />
                        </button>

                        <Swiper
                            key="authors-swiper"
                            modules={[Navigation, Autoplay]}
                            loop={true}
                            autoplay={{ delay: 3200, disableOnInteraction: false }}
                            navigation={{ prevEl: ".prev-auth", nextEl: ".next-auth" }}
                            observer={true}
                            observeParents={true}
                            breakpoints={{
                                0: { slidesPerView: 1, spaceBetween: 8 },
                                500: { slidesPerView: 2, spaceBetween: 12 },
                                700: { slidesPerView: 3, spaceBetween: 16 },
                                900: { slidesPerView: 4, spaceBetween: 18 },
                            }}
                        >
                            {authors.map((a) => (
                                <SwiperSlide key={a.id}>
                                    <div className="mp-author-card">
                                        <UserAvatar name={a.name} size={50} avatar={a.avatar} />
                                        <div className="mp-author-info">
                                            <span className="mp-author-name">{a.name}</span>
                                            <div className="mp-author-rating">
                                                <StarIcon className="mp-star" />
                                                <span>{a.rating}</span>
                                            </div>
                                            <div className="mp-author-modules">
                                                {a.modules} modules
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
            </section>
        </div>
    );
}
