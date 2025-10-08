import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/button";
import ClickOutsideWrapper from "../../../components/clickOutsideWrapper";

import { ReactComponent as CloseIcon } from "../../../images/close.svg";
import { ReactComponent as TrashIcon } from "../../../images/delete.svg";
import { ReactComponent as SwapArrows } from "../../../images/swap.svg";
import { ReactComponent as ArrowDown } from "../../../images/arrowDown.svg";
import { ReactComponent as ArrowUp } from "../../../images/arrowUp.svg";
import { ReactComponent as DeeplIcon } from "../../../images/deepl.svg";

import "../CreateModule/createModule.css";

const LANGUAGE_OPTIONS = ["Polish", "English", "Ukrainian", "German", "Spanish"];

export default function ModuleForm({
                                       mode = "create",
                                       initialData = {},
                                       onSubmit,
                                       onSubmitAndPractice
                                   }) {
    const navigate = useNavigate();

    const [tags, setTags] = useState(initialData.tags || []);
    const [tagInput, setTagInput] = useState("");
    const tagInputRef = useRef(null);

    const [name, setName] = useState(initialData.name || "");
    const [description, setDescription] = useState(initialData.description || "");

    const [globalLangLeft, setGlobalLangLeft] = useState(initialData.globalLangLeft || "Polish");
    const [globalLangRight, setGlobalLangRight] = useState(initialData.globalLangRight || "English");

    const [openLeft, setOpenLeft] = useState(false);
    const [openRight, setOpenRight] = useState(false);

    const [cards, setCards] = useState(initialData.cards || [
        { id: 1, term: "", definition: "" }
    ]);

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

    const handleCardChange = (id, field, value) =>
        setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

    const handleAddCard = () =>
        setCards(prev => [...prev, { id: Date.now(), term: "", definition: "" }]);

    const handleRemoveCard = (id) =>
        setCards(prev => prev.filter(c => c.id !== id));

    const handleSwapLanguages = () => {
        setGlobalLangLeft(globalLangRight);
        setGlobalLangRight(globalLangLeft);
    };

    const handleSubmit = () => {
        const moduleObj = {
            id: initialData.id || Date.now(),
            name,
            description,
            tags,
            cards,
            globalLangLeft,
            globalLangRight,
        };
        onSubmit?.(moduleObj);
        navigate("/library/module-view", { state: { module: moduleObj } });
    };

    const handleSubmitAndPractice = () => {
        handleSubmit();
        onSubmitAndPractice?.();
    };

    return (
        <div className="page-with-layout">


            <main className="create-module-page container">
                <div className="create-top">
                    <h2 className="create-title">
                        {mode === "edit" ? "Edit module" : "Create new module"}
                    </h2>
                    <div className="create-actions">
                        <Button variant="static" width={120} height={39} onClick={handleSubmit}>
                            {mode === "edit" ? "Save" : "Create"}
                        </Button>
                        <Button variant="static" width={180} height={39} onClick={handleSubmitAndPractice}>
                            {mode === "edit" ? "Save and practise" : "Create and practise"}
                        </Button>
                    </div>
                </div>

                {/* global languages */}
                <div className="global-lang-row">
                    <ClickOutsideWrapper onClickOutside={() => setOpenLeft(false)}>
                        <div className="lang-dropdown">
                            <Button
                                variant="toggle"
                                active={openLeft}
                                onClick={() => setOpenLeft(!openLeft)}
                                width={120}
                                height={32}
                            >
                                {globalLangLeft}
                                {openLeft ? <ArrowUp width={14} height={14} style={{ marginLeft: 6 }} /> : <ArrowDown width={14} height={14} style={{ marginLeft: 6 }} />}
                            </Button>
                            {openLeft && (
                                <div className="dropdown">
                                    {LANGUAGE_OPTIONS.map(opt => (
                                        <div key={opt} className="dropdown-item" onClick={() => { setGlobalLangLeft(opt); setOpenLeft(false); }}>
                                            {opt}
                                        </div>
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
                            <Button
                                variant="toggle"
                                active={openRight}
                                onClick={() => setOpenRight(!openRight)}
                                width={120}
                                height={32}
                            >
                                {globalLangRight}
                                {openRight ? <ArrowUp width={14} height={14} style={{ marginLeft: 6 }} /> : <ArrowDown width={14} height={14} style={{ marginLeft: 6 }} />}
                            </Button>
                            {openRight && (
                                <div className="dropdown">
                                    {LANGUAGE_OPTIONS.map(opt => (
                                        <div key={opt} className="dropdown-item" onClick={() => { setGlobalLangRight(opt); setOpenRight(false); }}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ClickOutsideWrapper>
                </div>

                {/* tags */}
                <div className="tags-block">
                    <div className="existing-tags">
                        {tags.map((t) => (
                            <div className="tag-pill" key={t}>
                                <span className="tag-text">{t}</span>
                                <button className="tag-remove-btn" onClick={() => handleRemoveTag(t)}>
                                    <CloseIcon width={12} height={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="tag-input-row">
                        <input
                            ref={tagInputRef}
                            className="tag-input"
                            placeholder="+ new tag"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKey}
                        />
                        <button className="tag-add-btn" onClick={handleAddTag}>+ Add</button>
                    </div>
                </div>

                {/* name/description */}
                <div className="module-inputs">
                    <input
                        className="module-input"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <input
                        className="module-input"
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div style={{ marginTop: 12 }}>
                    <Button variant="hover" width={120} height={39}>+ Import</Button>
                </div>

                {/* cards */}
                <div className="cards-list">
                    {cards.map((card, idx) => (
                        <div className="card-row" key={card.id}>
                            <div className="card-index-col">{idx + 1}</div>

                            <div className="card-center-col">
                                <div className="card-lang-top">
                                    <span>{globalLangLeft}</span>
                                    <button className="swap-btn" onClick={handleSwapLanguages}>
                                        <SwapArrows width={18} height={18}/>
                                    </button>
                                    <span>{globalLangRight}</span>
                                </div>

                                <div className="card-separator"/>

                                <div className="card-fields">
                                    <div className="field-with-label">
                                        <input
                                            className="card-input"
                                            placeholder="term"
                                            value={card.term}
                                            onChange={(e)=>handleCardChange(card.id,"term",e.target.value)}
                                        />
                                        <div className="field-label">Term</div>
                                    </div>
                                    <div className="field-with-label">
                                        <input
                                            className="card-input"
                                            placeholder="definition"
                                            value={card.definition}
                                            onChange={(e)=>handleCardChange(card.id,"definition",e.target.value)}
                                        />
                                        <div className="field-label">Definition</div>
                                    </div>
                                    <div className="deepl-link">
                                        <a href="#" target="_blank" rel="noreferrer">
                                            <DeeplIcon className="deepl-icon" />
                                            <span>DeepL</span>                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions-col">
                                <button className="icon-top-btn" onClick={()=>handleRemoveCard(card.id)}>
                                    <TrashIcon width={16} height={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card-actions">
                    <Button variant="hover" width={140} height={39} onClick={handleAddCard}>New card</Button>
                </div>

                <div className="bottom-actions">
                    <Button variant="static" width={100} height={33} onClick={handleSubmit}>
                        {mode === "edit" ? "Save" : "Create"}
                    </Button>
                    <Button variant="static" width={180} height={33} onClick={handleSubmitAndPractice}>
                        {mode === "edit" ? "Save and practise" : "Create and practise"}
                    </Button>
                </div>
            </main>

        </div>
    );
}