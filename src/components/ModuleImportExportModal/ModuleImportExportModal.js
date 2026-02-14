import React, { useState, useRef, useEffect } from "react";
import Button from "../button/button";
import Loader from "../loader/loader";
import { exportModule, importModule } from "../../api/modulesApi";
import { ReactComponent as CloseIcon } from "../../images/close.svg";
import { ReactComponent as ExportIcon } from "../../images/export.svg";
import { ReactComponent as ReplaceIcon } from "../../images/replace.svg";
import * as XLSX from "xlsx"; // Потрібно: npm install xlsx
import "./moduleImportExportModal.css";
import { useI18n } from "../../i18n";


export default function ModuleImportExportModal({
                                                    moduleId,
                                                    moduleName,
                                                    open,
                                                    onClose,
                                                    onSuccess,
                                                    isLocal = false, // true = парсимо на клієнті і повертаємо дані
                                                    onLocalImport    // callback(cardsArray)
                                                }) {
    const [activeTab, setActiveTab] = useState(isLocal ? "import" : "export");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const fileInputRef = useRef(null);
    const { t } = useI18n();

    useEffect(() => {
        if (open && isLocal) {
            setActiveTab("import");
        }
    }, [open, isLocal]);

    if (!open) return null;

    // --- Парсинг даних для локального режиму ---

    // 1. CSV (Текстовий парсер)
    const parseCSV = (text) => {
        const rows = [];
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
            if (!line.trim()) return;
            // Розділення по комі з урахуванням лапок
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            if (cleanParts.length >= 2) {
                rows.push({
                    id: Date.now() + Math.random(),
                    term: cleanParts[0],
                    definition: cleanParts[1]
                });
            }
        });
        return rows;
    };

    // 2. Excel (XLSX парсер через бібліотеку)
    const parseExcel = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    // Беремо перший аркуш
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    // Конвертуємо в масив масивів
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    const cards = [];
                    jsonData.forEach((row) => {
                        // Фільтруємо пусті рядки та заголовки (евристика)
                        if (!row || row.length < 2) return;

                        // Ігноруємо рядок, якщо це схоже на заголовок (Term/Definition)
                        const firstCell = String(row[0]).toLowerCase();
                        if (firstCell === "term" || firstCell === "original") return;

                        cards.push({
                            id: Date.now() + Math.random(),
                            term: row[0] ? String(row[0]) : "",
                            definition: row[1] ? String(row[1]) : ""
                        });
                    });
                    resolve(cards);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(file);
        });
    };

    // --- Handlers ---

    const handleExport = async (format) => {
        try {
            setLoading(true);
            setError(null);
            const response = await exportModule(moduleId, format);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const safeName = moduleName ? moduleName.replace(/\s+/g, '_') : 'module';
            link.setAttribute('download', `${safeName}_${moduleId}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setSuccessMsg(t("mieExportSuccess_label").replace("{format}", format.toUpperCase()));
        } catch (err) {
            console.error("Export failed:", err);
            setError("mieExportError_label");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        setSuccessMsg(null);

        const isCsv = file.name.toLowerCase().endsWith(".csv");
        const isExcel = file.name.toLowerCase().match(/\.(xlsx|xls)$/);

        if (!isCsv && !isExcel) {
            setError("mieErrorInvalidFormat_label");
            return;
        }

        setLoading(true);

        try {
            if (isLocal && onLocalImport) {
                // --- Локальний режим: Парсимо тут ---
                let parsedCards = [];

                if (isCsv) {
                    const text = await file.text();
                    parsedCards = parseCSV(text);
                } else if (isExcel) {
                    parsedCards = await parseExcel(file);
                }

                if (parsedCards.length > 0) {
                    onLocalImport(parsedCards); // Повертаємо масив карток
                    setSuccessMsg(t("mieSuccessAddedCards_label").replace("{count}", parsedCards.length));
                    setTimeout(() => onClose(), 1000);
                } else {
                    setError("mieErrorNoData_label");
                }
            } else {
                // --- API режим: Відправляємо на сервер ---
                await importModule(moduleId, file);
                setSuccessMsg(t("mieImportSuccess_label"));
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error("Import error:", err);
            setError("mieProcessingError_label");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="mie-overlay" onClick={onClose}>
            <div className="mie-box" onClick={(e) => e.stopPropagation()}>
                <div className="mie-header">
                    <h3>{isLocal ? t("mieHeaderImport_label") : t("mieHeaderManage_label")}</h3>
                    <button className="mie-close-btn" onClick={onClose}>
                        <CloseIcon width={20} height={20} />
                    </button>
                </div>

                {!isLocal && (
                    <div className="mie-tabs">
                        <button
                            className={`mie-tab ${activeTab === "export" ? "active" : ""}`}
                            onClick={() => { setActiveTab("export"); setError(null); setSuccessMsg(null); }}
                        >
                            {t("mieTabExport_label")}
                        </button>
                        <button
                            className={`mie-tab ${activeTab === "import" ? "active" : ""}`}
                            onClick={() => { setActiveTab("import"); setError(null); setSuccessMsg(null); }}
                        >
                            {t("mieTabImport_label")}
                        </button>
                    </div>
                )}

                <div className="mie-content">
                    {loading ? (
                        <div className="mie-loader-wrapper">
                            <Loader />
                            <p>{t("mieProcessing_label")}</p>
                        </div>
                    ) : (
                        <>
                            {error && <div className="mie-alert error">{t(error)}</div>}
                            {successMsg && <div className="mie-alert success">{successMsg}</div>}

                            {activeTab === "export" && !isLocal && (
                                <div className="mie-panel">
                                    <p className="mie-desc">{t("mieDescExport_label")}</p>
                                    <div className="mie-actions">
                                        <Button variant="static" onClick={() => handleExport("csv")} width="100%" height="48px">
                                            <ExportIcon className="mie-btn-icon" /> CSV
                                        </Button>
                                        <Button variant="static" onClick={() => handleExport("xlsx")} width="100%" height="48px">
                                            <ExportIcon className="mie-btn-icon" /> Excel (XLSX)
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "import" && (
                                <div className="mie-panel">
                                    <p className="mie-desc">
                                        {isLocal
                                            ? t("mieDescImportLocal_label")
                                            : t("mieDescImportApi_label")
                                        }
                                    </p>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".csv, .xlsx, .xls"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />

                                    <div className="mie-actions">
                                        <Button variant="static" onClick={() => fileInputRef.current?.click()} width="100%" height="48px">
                                            <ReplaceIcon className="mie-btn-icon" />
                                            {t("mieBtnSelectFile_label")}
                                        </Button>
                                    </div>
                                    <p className="mie-hint">
                                        {t("mieHintFormat_label")}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}