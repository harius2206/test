import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/button";
import ClickOutsideWrapper from "../../../components/clickOutsideWrapper";
import Loader from "../../../components/loader/loader";
import { getLanguages, getTopics } from "../../../api/modulesApi";
import ModuleImportExportModal from "../../../components/ModuleImportExportModal/ModuleImportExportModal";
import { translateWords } from "../../../api/deeplApi";
import { useI18n } from "../../../i18n";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as TrashIcon } from "../../../images/delete.svg";
import { ReactComponent as SwapArrows } from "../../../images/swap.svg";
import { ReactComponent as ArrowDown } from "../../../images/arrowDown.svg";
import { ReactComponent as ArrowUp } from "../../../images/arrowUp.svg";
import { ReactComponent as DeeplIcon } from "../../../images/deepl.svg";
import { ReactComponent as ReplaceIcon } from "../../../images/replace.svg";
import { ReactComponent as AddIcon } from "../../../images/add.svg";

import "../CreateModule/createModule.css";

export default function ModuleForm({
                                       mode = "create",
                                       initialData = {},
                                       loading = false,
                                       onSubmit,
                                       onSubmitAndPractice
                                   }) {
    const { t } = useI18n();
    const navigate = useNavigate();

    // --- Data Sources ---
    const [languagesList, setLanguagesList] = useState([]);
    const [topicsList, setTopicsList] = useState([]);

    // --- Form State ---
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [name, setName] = useState("");
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [description, setDescription] = useState("");

    const [selectedLangLeft, setSelectedLangLeft] = useState(null);
    const [selectedLangRight, setSelectedLangRight] = useState(null);

    // --- UI State ---
    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);
    const [openTopicDropdown, setOpenTopicDropdown] = useState(false);

    // Modal state
    const [showImportModal, setShowImportModal] = useState(false);

    const [cards, setCards] = useState([{ id: Date.now(), term: "", definition: "" }]);

    // State for translation loading (track which card is loading)
    const [translatingCardId, setTranslatingCardId] = useState(null);

    // --- 1. Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [langsRes, topicsRes] = await Promise.all([
                    getLanguages(),
                    getTopics()
                ]);

                const langsData = langsRes.data || [];
                const topicsData = topicsRes.data || [];

                setLanguagesList(langsData);
                setTopicsList(topicsData);

                if (mode === "create" && langsData.length >= 2 && !selectedLangLeft) {
                    setSelectedLangLeft(langsData[0]);
                    setSelectedLangRight(langsData[1]);
                }
            } catch (e) {
                console.error("Failed to load form data", e);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- 2. Populate State ---
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0 && languagesList.length > 0) {
            setName(initialData.name || "");
            setDescription(initialData.description || "");
            setTags(initialData.tags || []);

            const findLang = (val) => {
                if (!val) return languagesList[0];
                if (typeof val === 'object' && val.id) return languagesList.find(l => l.id === val.id) || val;
                if (typeof val === 'number') return languagesList.find(l => l.id === val) || languagesList[0];
                return languagesList[0];
            };

            if (initialData.globalLangLeft) setSelectedLangLeft(findLang(initialData.globalLangLeft));
            if (initialData.globalLangRight) setSelectedLangRight(findLang(initialData.globalLangRight));

            if (topicsList.length > 0 && initialData.topic) {
                if (typeof initialData.topic === 'object') setSelectedTopic(initialData.topic);
                else if (typeof initialData.topic === 'number') {
                    const found = topicsList.find(topicItem => topicItem.id === initialData.topic);
                    if (found) setSelectedTopic(found);
                }
            }

            if (initialData.cards && initialData.cards.length > 0) {
                setCards(initialData.cards);
            }
        }
    }, [initialData, languagesList, topicsList]);

    // --- Handlers ---
    const handleCardChange = (id, field, value) => setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    const handleAddCard = () => setCards(prev => [...prev, { id: Date.now(), term: "", definition: "" }]);

    const handleRemoveCard = (e, id) => {
        e.stopPropagation();
        if (cards.length > 1) setCards(prev => prev.filter(c => c.id !== id));
    };

    const handleAddTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;

        // Перевірка на 10 символів
        if (trimmed.length > 10) {
            alert(t("mfTagTooLong", "Тег не може бути довшим за 10 символів"));
            return;
        }

        if (!tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSwapLanguages = () => {
        const temp = selectedLangLeft;
        setSelectedLangLeft(selectedLangRight);
        setSelectedLangRight(temp);
    };

    const handleSubmit = () => {
        if (!name.trim()) return alert(t("mfEnterModuleName"));
        if (!selectedLangLeft || !selectedLangRight) return alert(t("mfSelectLanguages"));

        const validCards = cards.filter(c => c.term.trim() || c.definition.trim());
        if (validCards.length === 0) return alert(t("mfAddAtLeastOneCard"));

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

    const handleDeeplTranslate = async (cardId, term) => {
        if (!term) return;
        if (!selectedLangRight) {
            alert(t("mfTranslateTargetLangFirst"));
            return;
        }

        setTranslatingCardId(cardId);

        try {
            const targetLang = selectedLangRight.id;

            const response = await translateWords([term], targetLang);

            const translatedData = response.data.translations[0];
            const translatedText = typeof translatedData === 'string' ? translatedData : translatedData?.text;

            if (translatedText) {
                handleCardChange(cardId, "definition", translatedText);
            }

        } catch (err) {
            console.error("Translation failed", err);
            const errorMsg = err.response?.data?.lang_to
                ? "Translation error: " + err.response.data.lang_to
                : "Translation failed. Check if your API key is valid in Safety settings.";
            alert(errorMsg);
        } finally {
            setTranslatingCardId(null);
        }
    };

    const handleImportedCards = (importedCards) => {
        if (!importedCards || importedCards.length === 0) return;

        setCards(prev => {
            const existingNotEmpty = prev.filter(c => c.term.trim() !== "" || c.definition.trim() !== "");
            return [...existingNotEmpty, ...importedCards];
        });
    };

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
                            <Button
                                variant="hover"
                                width={130}
                                height={39}
                                onClick={() => setShowImportModal(true)}
                                title={t("mfImportTitle")}
                            >
                                <ReplaceIcon style={{ marginRight: 6, width: 16, height: 16 }} />
                                {t("mfImportCards")}
                            </Button>

                            <Button variant="static" width={120} height={39} onClick={handleSubmit} disabled={loading}>
                                {loading ? <div style={{ transform: 'scale(0.5)' }}><Loader /></div> : (mode === "edit" ? t("mfSaveButton") : t("mfCreateButton"))}
                            </Button>
                        </div>

                        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title={t("mfCloseButton")}>
                            <CloseIcon width={28} height={28} />
                        </button>
                    </div>
                </div>

                <div className="global-lang-row">
                    <ClickOutsideWrapper onClickOutside={() => setOpenLeft(false)}>
                        <div className="lang-dropdown">
                            <Button variant="toggle" active={openLeft} onClick={() => setOpenLeft(!openLeft)} width={160} height={32}>
                                {selectedLangLeft ? selectedLangLeft.name : t("mfSelectLanguage")}
                                {openLeft ? <ArrowUp width={14} height={14} style={{ marginLeft: 6 }} /> : <ArrowDown width={14} height={14} style={{ marginLeft: 6 }} />}
                            </Button>
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
                            <Button variant="toggle" active={openRight} onClick={() => setOpenRight(!openRight)} width={160} height={32}>
                                {selectedLangRight ? selectedLangRight.name : t("mfSelectLanguage")}
                                {openRight ? <ArrowUp width={14} height={14} style={{ marginLeft: 6 }} /> : <ArrowDown width={14} height={14} style={{ marginLeft: 6 }} />}
                            </Button>
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
                                    {openTopicDropdown ? <ArrowUp width={14} height={14} /> : <ArrowDown width={14} height={14} />}
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
                                    <div key={i} className="tag-item-badge" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'var(--bg-secondary)',
                                        padding: '4px 10px',
                                        borderRadius: '16px',
                                        fontSize: '14px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                                        >
                                            <CloseIcon width={12} height={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cards-list">
                    {cards.map((card, idx) => (
                        <div className="card-row" key={card.id}>
                            <div className="card-index-col">{idx + 1}</div>
                            <div className="card-center-col">
                                <div className="card-lang-top">
                                    <span className="lang-left">{selectedLangLeft?.name}</span>
                                    <span className="lang-right">{selectedLangRight?.name}</span>
                                </div>
                                <div className="card-separator" />
                                <div className="card-fields">
                                    <div className="field-with-label">
                                        <input className="card-input" placeholder={t("mfTermLabel")} value={card.term} onChange={(e) => handleCardChange(card.id, "term", e.target.value)} />
                                        <div className="field-label">{t("mfTermLabel")}</div>
                                    </div>
                                    <div className="field-with-label">
                                        <input className="card-input" placeholder={t("mfDefinitionLabel")} value={card.definition} onChange={(e) => handleCardChange(card.id, "definition", e.target.value)} />
                                        <div className="field-label">{t("mfDefinitionLabel")}</div>
                                    </div>

                                    <div className="deepl-link">
                                        <button
                                            type="button"
                                            className="deepl-btn"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
                                            onClick={() => handleDeeplTranslate(card.id, card.term)}
                                            disabled={translatingCardId === card.id || !card.term}
                                            title={t("mfDeeplTranslate")}
                                        >
                                            <DeeplIcon className="deepl-icon" style={{ opacity: translatingCardId === card.id ? 0.5 : 1 }}/>
                                            <span style={{ color: 'var(--text-color)', fontSize: '12px' }}>
                                                {translatingCardId === card.id ? t("mfDeeplLoading") : t("mfDeeplTranslate")}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-actions-col">
                                <button className="icon-top-btn delete-card-btn" onClick={(e) => handleRemoveCard(e, card.id)} disabled={cards.length <= 1} title={t("mfRemoveCard")}>
                                    <TrashIcon width={16} height={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card-actions">
                    <Button variant="hover" width={140} height={39} onClick={handleAddCard}>
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