import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/button";
import ClickOutsideWrapper from "../../../components/clickOutsideWrapper";
import Loader from "../../../components/loader/loader";
import { getLanguages, getTopics } from "../../../api/modulesApi";
import ModuleImportExportModal from "../../../components/ModuleImportExportModal/ModuleImportExportModal";
import { translateWords } from "../../../api/deeplApi";
import { useI18n } from "../../../i18n";
import { useError } from "../../../context/ErrorContext";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as TrashIcon } from "../../../images/delete.svg";
import { ReactComponent as SwapArrows } from "../../../images/swap.svg";
import { ReactComponent as ArrowDown } from "../../../images/arrowDown.svg";
import { ReactComponent as ArrowUp } from "../../../images/arrowUp.svg";
import { ReactComponent as DeeplIcon } from "../../../images/deepl.svg";
import { ReactComponent as ReplaceIcon } from "../../../images/replace.svg";
import { ReactComponent as AddIcon } from "../../../images/add.svg";

import "../CreateModule/createModule.css";

const CardRow = React.memo(({
                                card,
                                idx,
                                langLeftName,
                                langRightName,
                                isActive,
                                isTranslating,
                                canDelete,
                                tTermLabel,
                                tDefinitionLabel,
                                tDeeplTranslate,
                                tDeeplLoading,
                                tRemoveCard,
                                onFocus,
                                onBlur,
                                onChange,
                                onTranslate,
                                onRemove
                            }) => {
    const isCardIncomplete = !card.term.trim() || !card.definition.trim();

    return (
        <div
            className={`card-row ${isCardIncomplete ? "incomplete-card" : ""} ${isActive ? "active-card" : ""}`}
            onFocus={() => onFocus(card.id)}
            onBlur={onBlur}
        >
            <div className="card-index-col">{idx + 1}</div>
            <div className="card-center-col">
                <div className="card-lang-top">
                    <span className="lang-left">{langLeftName}</span>
                    <span className="lang-right">{langRightName}</span>
                </div>
                <div className="card-separator" />
                <div className="card-fields">
                    <div className="field-with-label">
                        <input
                            className="card-input"
                            placeholder={tTermLabel}
                            value={card.term}
                            onChange={(e) => onChange(card.id, "term", e.target.value)}
                        />
                        <div className="field-label">{tTermLabel}</div>
                    </div>
                    <div className="field-with-label">
                        <input
                            className="card-input"
                            placeholder={tDefinitionLabel}
                            value={card.definition}
                            onChange={(e) => onChange(card.id, "definition", e.target.value)}
                        />
                        <div className="field-label">{tDefinitionLabel}</div>
                    </div>

                    <div className="deepl-link">
                        <button
                            type="button"
                            className="deepl-btn"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTranslate(card.id, card.term);
                            }}
                            disabled={isTranslating || !card.term}
                            title={tDeeplTranslate}
                        >
                            <DeeplIcon className="deepl-icon" style={{ opacity: isTranslating ? 0.5 : 1 }}/>
                            <span style={{ color: 'var(--text-color)', fontSize: '12px' }}>
                                {isTranslating ? tDeeplLoading : tDeeplTranslate}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-actions-col">
                <button
                    type="button"
                    className="icon-top-btn delete-card-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(e, card.id);
                    }}
                    disabled={!canDelete}
                    title={tRemoveCard}
                >
                    <TrashIcon width={16} height={16} />
                </button>
            </div>
        </div>
    );
});


export default function ModuleForm({
                                       mode = "create",
                                       initialData = {},
                                       loading = false,
                                       onSubmit,
                                       onSubmitAndPractice
                                   }) {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { showError } = useError();

    const [languagesList, setLanguagesList] = useState([]);
    const [topicsList, setTopicsList] = useState([]);

    const [tags, setTags] = useState(initialData?.tags || []);
    const [newTag, setNewTag] = useState("");
    const [name, setName] = useState(initialData?.name || "");
    const [selectedTopic, setSelectedTopic] = useState(initialData?.topic || null);
    const [description, setDescription] = useState(initialData?.description || "");

    const [selectedLangLeft, setSelectedLangLeft] = useState(
        initialData?.globalLangLeft && typeof initialData.globalLangLeft === 'object' ? initialData.globalLangLeft : null
    );
    const [selectedLangRight, setSelectedLangRight] = useState(
        initialData?.globalLangRight && typeof initialData.globalLangRight === 'object' ? initialData.globalLangRight : null
    );

    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);
    const [openTopicDropdown, setOpenTopicDropdown] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const [cards, setCards] = useState(
        initialData?.cards?.length > 0 ? initialData.cards : [{ id: Date.now(), term: "", definition: "" }]
    );

    const CHUNK_SIZE = 40;
    const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
    const loadMoreRef = useRef(null);

    const [activeCardId, setActiveCardId] = useState(null);
    const [translatingCardId, setTranslatingCardId] = useState(null);
    const isDataPopulated = useRef(false);

    const tTerm = t("mfTermLabel");
    const tDef = t("mfDefinitionLabel");
    const tDeepl = t("mfDeeplTranslate");
    const tDeeplLoad = t("mfDeeplLoading");
    const tRemove = t("mfRemoveCard");

    useEffect(() => {
        if (visibleCount >= cards.length) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => Math.min(prev + CHUNK_SIZE, cards.length));
            }
        }, { rootMargin: "1500px" });

        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [visibleCount, cards.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [langsRes, topicsRes] = await Promise.all([getLanguages(), getTopics()]);
                setLanguagesList(langsRes.data || []);
                setTopicsList(topicsRes.data || []);
            } catch (e) {
                console.error("Failed to load form data", e);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (isDataPopulated.current) return;

        if (initialData && Object.keys(initialData).length > 0) {
            const getLang = (val, list) => {
                if (!val) return null;
                if (typeof val === 'object' && val.name) return val;
                if (list.length > 0) {
                    if (typeof val === 'object' && val.id) return list.find(l => l.id === val.id) || val;
                    if (typeof val === 'number') return list.find(l => l.id === val) || list[0];
                }
                return typeof val === 'object' ? val : null;
            };

            setSelectedLangLeft(prev => prev || getLang(initialData.globalLangLeft, languagesList));
            setSelectedLangRight(prev => prev || getLang(initialData.globalLangRight, languagesList));

            const getTopic = (val, list) => {
                if (!val) return null;
                if (typeof val === 'object' && val.name) return val;
                if (list.length > 0 && typeof val === 'number') return list.find(t => t.id === val) || null;
                return typeof val === 'object' ? val : null;
            };
            setSelectedTopic(prev => prev || getTopic(initialData.topic, topicsList));

            if (languagesList.length > 0 && topicsList.length > 0) {
                isDataPopulated.current = true;
            }
        }
    }, [initialData, languagesList, topicsList]);

    const handleCardChange = useCallback((id, field, value) => {
        setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    }, []);

    const handleAddCard = useCallback(() => {
        setCards(prev => [...prev, { id: Date.now(), term: "", definition: "" }]);
        setVisibleCount(prev => prev + 1);
    }, []);

    const handleRemoveCard = useCallback((e, id) => {
        setCards(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev);
    }, []);

    const handleBlur = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setActiveCardId(null);
        }
    }, []);

    const handleDeeplTranslate = useCallback(async (cardId, term) => {
        if (!term) return;
        if (!selectedLangRight) {
            showError(t("mfTranslateTargetLangFirst", "Спочатку оберіть мову перекладу"));
            return;
        }

        setTranslatingCardId(cardId);
        try {
            const response = await translateWords([term], selectedLangRight.id);
            const translatedData = response.data.translations[0];
            const translatedText = typeof translatedData === 'string' ? translatedData : translatedData?.text;

            if (translatedText) {
                handleCardChange(cardId, "definition", translatedText);
            }
        } catch (err) {
            console.error("Translation failed", err);
            showError(err);
        } finally {
            setTranslatingCardId(null);
        }
    }, [selectedLangRight, showError, t, handleCardChange]);

    const handleAddTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;
        if (trimmed.length > 10) return showError(t("mfTagTooLong", "Тег не може бути довшим за 10 символів"));
        if (!tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove) => setTags(tags.filter(t => t !== tagToRemove));

    const handleSwapLanguages = () => {
        const temp = selectedLangLeft;
        setSelectedLangLeft(selectedLangRight);
        setSelectedLangRight(temp);
    };

    const handleSubmit = () => {
        if (!name.trim()) return showError(t("mfEnterModuleName", "Введіть назву модуля"));
        if (!selectedTopic) return showError(t("mfSelectTopicWarning", "Виберіть тему модуля"));
        if (!selectedLangLeft || !selectedLangRight) return showError(t("mfSelectLanguages", "Виберіть мови"));

        const validCards = cards.filter(c => c.term.trim() || c.definition.trim());
        if (validCards.length === 0) return showError(t("mfAddAtLeastOneCard", "Додайте хоча б одну картку"));

        const moduleObj = {
            id: initialData.id,
            name,
            topic: selectedTopic,
            description,
            tags,
            cards: validCards,
            globalLangLeft: selectedLangLeft,
            globalLangRight: selectedLangRight,
        };
        onSubmit?.(moduleObj);
    };

    const handleImportedCards = (importedCards) => {
        if (!importedCards || importedCards.length === 0) return;
        setCards(prev => {
            const existingNotEmpty = prev.filter(c => c.term.trim() !== "" || c.definition.trim() !== "");
            return [...existingNotEmpty, ...importedCards];
        });
        setVisibleCount(CHUNK_SIZE);
    };

    const hasIncompleteCards = cards.some(c => !c.term.trim() || !c.definition.trim());

    return (
        <div className="page-with-layout">
            <main className="create-module-page container">

                <div className="create-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 className="create-title">
                            {mode === "edit" ? t("mfEditModuleTitle") : t("mfCreateModuleTitle")}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="create-actions" style={{ display: 'flex', gap: '10px' }}>
                            <Button variant="hover" width={130} height={39} onClick={() => setShowImportModal(true)} title={t("mfImportTitle")}>
                                <ReplaceIcon style={{ marginRight: 6, width: 16, height: 16 }} />
                                {t("mfImportCards")}
                            </Button>

                            <Button variant="static" width={120} height={39} onClick={handleSubmit} disabled={loading}>
                                {loading ? <div style={{ transform: 'scale(0.5)' }}><Loader /></div> : (mode === "edit" ? t("mfSaveButton") : t("mfCreateButton"))}
                            </Button>
                        </div>

                        <button className="cm-close-btn" onClick={() => navigate(-1)} title={t("mfCloseButton")}>
                            <CloseIcon width={24} height={24} className="close-icon-global" />
                        </button>
                    </div>
                </div>

                <div className="global-lang-row">
                    <ClickOutsideWrapper onClickOutside={() => setOpenLeft(false)}>
                        <div className="lang-dropdown">
                            <button className={`btn ${openLeft ? 'active' : ''}`} onClick={() => setOpenLeft(!openLeft)}>
                                {selectedLangLeft ? selectedLangLeft.name : t("mfSelectLanguage")}
                                {openLeft ? <ArrowUp width={14} height={14} style={{ marginLeft: 6 }} /> : <ArrowDown width={14} height={14} style={{ marginLeft: 6 }} />}
                            </button>
                            {openLeft && (
                                <div className="dropdown">
                                    {languagesList.map(opt => (
                                        <div key={opt.id} className="dropdown-item" onClick={() => { setSelectedLangLeft(opt); setOpenLeft(false); }}>{opt.name}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ClickOutsideWrapper>

                    <button className="swap-btn" onClick={handleSwapLanguages}>
                        <SwapArrows width={20} height={20} />
                    </button>

                    <ClickOutsideWrapper onClickOutside={() => setOpenRight(false)}>
                        <div className="lang-dropdown">
                            <button className={`btn ${openRight ? 'active' : ''}`} onClick={() => setOpenRight(!openRight)}>
                                {selectedLangRight ? selectedLangRight.name : t("mfSelectLanguage")}
                                {openRight ? <ArrowUp width={14} height={14} style={{ marginLeft: 6 }} /> : <ArrowDown width={14} height={14} style={{ marginLeft: 6 }} />}
                            </button>
                            {openRight && (
                                <div className="dropdown">
                                    {languagesList.map(opt => (
                                        <div key={opt.id} className="dropdown-item" onClick={() => { setSelectedLangRight(opt); setOpenRight(false); }}>{opt.name}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ClickOutsideWrapper>
                </div>

                <div className="module-inputs">
                    <input className="module-input" placeholder={t("mfModuleNamePlaceholder")} value={name} onChange={e => setName(e.target.value)} />

                    <div style={{ width: "100%" }}>
                        <ClickOutsideWrapper onClickOutside={() => setOpenTopicDropdown(false)}>
                            <div className="lang-dropdown" style={{ width: '100%' }}>
                                <div className="module-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setOpenTopicDropdown(!openTopicDropdown)}>
                                    <span style={{ color: selectedTopic ? 'inherit' : '#757575' }}>
                                        {selectedTopic ? selectedTopic.name : t("mfSelectTopic")}
                                    </span>
                                    {openTopicDropdown ? <ArrowUp width={14} height={14} className="topic-arrow" /> : <ArrowDown width={14} height={14} className="topic-arrow" />}
                                </div>
                                {openTopicDropdown && (
                                    <div className="dropdown" style={{ width: '100%', top: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                                        {topicsList.length > 0 ? (
                                            topicsList.map(topic => (
                                                <div key={topic.id} className="dropdown-item" onClick={() => { setSelectedTopic(topic); setOpenTopicDropdown(false); }}>
                                                    {topic.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item" style={{ cursor: 'default', color: 'gray' }}>{t("mfNoTopicsAvailable")}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ClickOutsideWrapper>
                    </div>

                    <input className="module-input" placeholder={t("mfModuleDescriptionPlaceholder")} value={description} onChange={e => setDescription(e.target.value)} />

                    {/* СЕКЦІЯ ТЕГІВ */}
                    <div className="tags-management-row" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <div className="tag-input-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                className="module-input"
                                style={{ flex: 1, marginBottom: 0 }}
                                placeholder={t("mfAddTagPlaceholder", "Введіть тег (макс. 10 симв.)")}
                                value={newTag}
                                maxLength={10}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <Button variant="hover" width={100} height={42} onClick={handleAddTag}>
                                <AddIcon width={16} height={16} style={{ marginRight: 6 }} />
                                {t("mfAddTagBtn", "Додати")}
                            </Button>
                        </div>

                        {tags.length > 0 && (
                            <div className="tags-list-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {tags.map((tag, i) => (
                                    <div key={i} className="tag-item-badge">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                                            <CloseIcon width={12} height={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cards-list">
                    {cards.slice(0, visibleCount).map((card, idx) => (
                        <CardRow
                            key={card.id}
                            card={card}
                            idx={idx}
                            langLeftName={selectedLangLeft?.name}
                            langRightName={selectedLangRight?.name}
                            isActive={activeCardId === card.id}
                            isTranslating={translatingCardId === card.id}
                            canDelete={cards.length > 1}
                            tTermLabel={tTerm}
                            tDefinitionLabel={tDef}
                            tDeeplTranslate={tDeepl}
                            tDeeplLoading={tDeeplLoad}
                            tRemoveCard={tRemove}
                            onFocus={setActiveCardId}
                            onBlur={handleBlur}
                            onChange={handleCardChange}
                            onTranslate={handleDeeplTranslate}
                            onRemove={handleRemoveCard}
                        />
                    ))}

                    {visibleCount < cards.length && (
                        <div ref={loadMoreRef} style={{ height: "40px", width: "100%" }}></div>
                    )}
                </div>

                <div className="card-actions">
                    <Button variant="hover" width={140} height={39} onClick={handleAddCard} disabled={hasIncompleteCards}>
                        {t("mfAddCard")}
                    </Button>
                </div>
                <div className="bottom-actions">
                    <Button variant="static" width={100} height={33} onClick={handleSubmit} disabled={loading}>
                        {loading ? <div style={{ transform: 'scale(0.5)' }}><Loader /></div> : (mode === "edit" ? t("mfSaveButton") : t("mfCreateButton"))}
                    </Button>
                </div>

                <ModuleImportExportModal
                    open={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    moduleId={initialData?.id}
                    moduleName={name}
                    isLocal={mode !== "edit"}
                    onLocalImport={handleImportedCards}
                    onSuccess={() => {
                        if (mode === "edit") window.location.reload();
                    }}
                />
            </main>
        </div>
    );
}