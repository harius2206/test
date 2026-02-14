import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import CardsCheckCard from "../../../components/cardsCheckCard/cardsCheckCard";
import CardsCheckResult from "../../../components/cardsCheckResult/cardsCheckResult";
import closeIcon from "../../../images/close.svg";
import { getModuleById, updateCardLearnStatus } from "../../../api/modulesApi";
import { useI18n } from "../../../i18n";
import "./cardsCheck.css";

export default function CardsCheck() {
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const ccModuleIdFromUrl = searchParams.get("id");
    const ccOriginatingModule = location.state?.module;
    const ccModuleId = ccModuleIdFromUrl || ccOriginatingModule?.id;

    const [ccModuleName, ccSetModuleName] = useState(ccOriginatingModule?.name || t("ccModuleLabel"));
    const [ccCards, ccSetCards] = useState([]);
    const [ccLoading, ccSetLoading] = useState(true);
    const [ccCurrent, ccSetCurrent] = useState(0);
    const [ccLearned, ccSetLearned] = useState(0);
    const [ccNotLearned, ccSetNotLearned] = useState(0);
    const [ccFinished, ccSetFinished] = useState(false);
    const [ccTime, ccSetTime] = useState(0);

    const ccIntervalRef = useRef(null);

    useEffect(() => {
        if (ccModuleId) {
            ccSetLoading(true);
            getModuleById(ccModuleId)
                .then((res) => {
                    const data = res.data;
                    if (data.name) ccSetModuleName(data.name);

                    const loadedCards = (data.cards || []).map(c => ({
                        ...c,
                        term: c.original,
                        definition: c.translation
                    }));
                    ccSetCards(loadedCards);
                })
                .catch((err) => {
                    console.error("Error fetching module cards:", err);
                    ccSetCards([]);
                })
                .finally(() => {
                    ccSetLoading(false);
                });
        } else {
            ccSetLoading(false);
        }
    }, [ccModuleId]);

    // Таймер
    useEffect(() => {
        if (!ccLoading && ccCards.length > 0 && !ccFinished) {
            ccIntervalRef.current = setInterval(() => {
                ccSetTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(ccIntervalRef.current);
    }, [ccLoading, ccCards.length, ccFinished]);

    const ccHandleAnswer = async (isLearned) => {
        if (isLearned) ccSetLearned((prev) => prev + 1);
        else ccSetNotLearned((prev) => prev + 1);

        const currentCard = ccCards[ccCurrent];
        if (currentCard && currentCard.id) {
            try {
                await updateCardLearnStatus(currentCard.id, isLearned, {
                    original: currentCard.term,
                    translation: currentCard.definition,
                    learned: "learned"
                });
            } catch (error) {
                console.error("Failed to update card status:", error);
            }
        }

        if (ccCurrent + 1 < ccCards.length) {
            ccSetCurrent((prev) => prev + 1);
        } else {
            ccSetFinished(true);
            clearInterval(ccIntervalRef.current);
        }
    };

    const ccHandleRetry = () => {
        ccSetCurrent(0);
        ccSetLearned(0);
        ccSetNotLearned(0);
        ccSetFinished(false);
        ccSetTime(0);

        clearInterval(ccIntervalRef.current);
        ccIntervalRef.current = setInterval(() => {
            ccSetTime((prev) => prev + 1);
        }, 1000);
    };

    const ccHandleClose = () => {
        clearInterval(ccIntervalRef.current);
        if (ccModuleId) {
            navigate(`/library/module-view?id=${ccModuleId}`, { state: { module: { id: ccModuleId, name: ccModuleName } } });
        } else {
            navigate(-1);
        }
    };

    const ccAvg = (ccLearned + ccNotLearned) > 0
        ? (ccTime / (ccLearned + ccNotLearned)).toFixed(1)
        : 0;

    if (ccLoading) {
        return (
            <div className="cc-page">
                <div className="cc-header">
                    <h3>{t("ccLoading")}</h3>
                </div>
            </div>
        );
    }

    if (!ccLoading && ccCards.length === 0) {
        return (
            <div className="cc-page">
                <div className="cc-header">
                    <h2 className="cc-module-title">{ccModuleName}</h2>
                    <button className="cc-close-btn" onClick={ccHandleClose}>
                        <img src={closeIcon} alt="Close" />
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p>{t("ccNoCards")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cc-page">
            <div className="cc-header">
                <h2 className="cc-module-title">{ccModuleName}</h2>

                <div className="cc-progress">
                    {ccCurrent + 1}/{ccCards.length}
                </div>

                <button className="cc-close-btn" onClick={ccHandleClose}>
                    <img src={closeIcon} alt="Close" />
                </button>
            </div>

            {!ccFinished ? (
                <CardsCheckCard
                    term={ccCards[ccCurrent].term}
                    definition={ccCards[ccCurrent].definition}
                    learnedCount={ccLearned}
                    notLearnedCount={ccNotLearned}
                    onAnswer={ccHandleAnswer}
                />
            ) : (
                <CardsCheckResult
                    learned={ccLearned}
                    notLearned={ccNotLearned}
                    total={ccCards.length}
                    time={ccTime}
                    avg={ccAvg}
                    onRetry={ccHandleRetry}
                />
            )}
        </div>
    );
}