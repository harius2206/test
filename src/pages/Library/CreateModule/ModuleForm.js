import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/button";
import ClickOutsideWrapper from "../../../components/clickOutsideWrapper";
import { getLanguages, getTopics } from "../../../api/modulesApi";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as TrashIcon } from "../../../images/delete.svg";
import { ReactComponent as SwapArrows } from "../../../images/swap.svg";
import { ReactComponent as ArrowDown } from "../../../images/arrowDown.svg";
import { ReactComponent as ArrowUp } from "../../../images/arrowUp.svg";
import { ReactComponent as DeeplIcon } from "../../../images/deepl.svg";

import "../CreateModule/createModule.css";

export default function ModuleForm({
                                       mode = "create",
                                       initialData = {},
                                       loading = false,
                                       onSubmit,
                                       onSubmitAndPractice
                                   }) {
    const navigate = useNavigate();

    // --- Data Sources (API Lists) ---
    const [languagesList, setLanguagesList] = useState([]);
    const [topicsList, setTopicsList] = useState([]);

    // --- Form State ---
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const tagInputRef = useRef(null);

    const [name, setName] = useState("");
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [description, setDescription] = useState("");

    const [selectedLangLeft, setSelectedLangLeft] = useState(null);
    const [selectedLangRight, setSelectedLangRight] = useState(null);

    // --- UI State ---
    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);
    const [openTopicDropdown, setOpenTopicDropdown] = useState(false);

    const [cards, setCards] = useState([{ id: Date.now(), term: "", definition: "" }]);

    // --- 1. Fetch Data (Langs & Topics) ---
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

    // --- 2. Populate State from initialData (after API lists are loaded) ---
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
                    const found = topicsList.find(t => t.id === initialData.topic);
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

    // Хендлер видалення
    const handleRemoveCard = (e, id) => {
        e.stopPropagation();
        if (cards.length > 1) setCards(prev => prev.filter(c => c.id !== id));
    };

    // ГЛОБАЛЬНИЙ СВАП МОВ
    const handleSwapLanguages = () => {
        const temp = selectedLangLeft;
        setSelectedLangLeft(selectedLangRight);
        setSelectedLangRight(temp);
    };

    const handleAddTag = () => {
        const v = (tagInput || "").trim();
        if (!v) return;
        if (!tags.includes(v)) setTags(prev => [...prev, v]);
        setTagInput("");
    };

    const handleRemoveTag = (t) => setTags(prev => prev.filter(x => x !== t));

    const handleTagKey = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };


    const handleSubmit = () => {
        if (!name.trim()) return alert("Please enter a module name");
        const validCards = cards.filter(c => c.term.trim() || c.definition.trim());
        if (validCards.length === 0) return alert("Please add at least one card");
        if (!selectedLangLeft || !selectedLangRight) return alert("Please select languages");

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

    return (
        <div className="page-with-layout">
            <main className="create-module-page container">
                <div className="create-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => navigate(-1)} className="back-btn" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
                        <h2 className="create-title">{mode === "edit" ? "Edit module" : "Create new module"}</h2>
                    </div>
                    <div className="create-actions">
                        <Button variant="static" width={120} height={39} onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : (mode === "edit" ? "Save" : "Create")}
                        </Button>
                    </div>
                </div>

                {/* --- Languages Select --- */}
                <div className="global-lang-row">
                    <ClickOutsideWrapper onClickOutside={() => setOpenLeft(false)}>
                        <div className="lang-dropdown">
                            <Button variant="toggle" active={openLeft} onClick={() => setOpenLeft(!openLeft)} width={160} height={32}>
                                {selectedLangLeft ? selectedLangLeft.name : "Select Language"}
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

                    {/* ГЛОБАЛЬНА КНОПКА СВАПУ МОВ */}
                    <button className="swap-btn" onClick={handleSwapLanguages}>
                        <SwapArrows width={20} height={20} />
                    </button>

                    <ClickOutsideWrapper onClickOutside={() => setOpenRight(false)}>
                        <div className="lang-dropdown">
                            <Button variant="toggle" active={openRight} onClick={() => setOpenRight(!openRight)} width={160} height={32}>
                                {selectedLangRight ? selectedLangRight.name : "Select Language"}
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

                {/* --- Inputs --- */}
                <div className="module-inputs">
                    <input className="module-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />

                    {/* Topic Select */}
                    <div style={{ width: "100%" }}>
                        <ClickOutsideWrapper onClickOutside={() => setOpenTopicDropdown(false)}>
                            <div className="lang-dropdown" style={{ width: '100%' }}>
                                <div
                                    className="module-input"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                    onClick={() => setOpenTopicDropdown(!openTopicDropdown)}
                                >
                                    <span style={{ color: selectedTopic ? 'inherit' : '#757575' }}>
                                        {selectedTopic ? selectedTopic.name : "Select Topic"}
                                    </span>
                                    {openTopicDropdown ? <ArrowUp width={14} height={14} /> : <ArrowDown width={14} height={14} />}
                                </div>

                                {openTopicDropdown && (
                                    <div className="dropdown" style={{ width: '100%', top: '100%' }}>
                                        {topicsList.length > 0 ? (
                                            topicsList.map(topic => (
                                                <div key={topic.id} className="dropdown-item" onClick={() => { setSelectedTopic(topic); setOpenTopicDropdown(false); }}>
                                                    {topic.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="dropdown-item" style={{ cursor: 'default', color: 'gray' }}>No topics available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ClickOutsideWrapper>
                    </div>

                    <input className="module-input" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                {/* --- Cards --- */}
                <div className="cards-list">
                    {cards.map((card, idx) => (
                        <div className="card-row" key={card.id}>
                            <div className="card-index-col">{idx + 1}</div>
                            <div className="card-center-col">

                                {/* Шапка картки (Мови) */}
                                <div className="card-lang-top">
                                    <span className="lang-left">{selectedLangLeft?.name}</span>
                                    {/* Кнопка Swap прибрана звідси */}
                                    <span className="lang-right" style={{marginLeft: 'auto'}}>{selectedLangRight?.name}</span>
                                </div>

                                <div className="card-separator" />

                                <div className="card-fields">
                                    <div className="field-with-label">
                                        <input className="card-input" placeholder="Term" value={card.term} onChange={(e) => handleCardChange(card.id, "term", e.target.value)} />
                                        <div className="field-label">Term</div>
                                    </div>
                                    <div className="field-with-label">
                                        <input className="card-input" placeholder="Definition" value={card.definition} onChange={(e) => handleCardChange(card.id, "definition", e.target.value)} />
                                        <div className="field-label">Definition</div>
                                    </div>
                                    <div className="deepl-link">
                                        <a href="https://www.deepl.com/" target="_blank" rel="noreferrer"><DeeplIcon className="deepl-icon" /><span>DeepL</span></a>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопка видалення (Мусорка) */}
                            <div className="card-actions-col">
                                <button
                                    className="icon-top-btn delete-card-btn"
                                    onClick={(e) => handleRemoveCard(e, card.id)}
                                    disabled={cards.length <= 1}
                                    title="Remove card"
                                >
                                    <TrashIcon width={16} height={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card-actions"><Button variant="hover" width={140} height={39} onClick={handleAddCard}>+ Add card</Button></div>
                <div className="bottom-actions">
                    <Button variant="static" width={100} height={33} onClick={handleSubmit} disabled={loading}>{mode === "edit" ? "Save" : "Create"}</Button>
                </div>
            </main>
        </div>
    );
}