import { createContext, useContext, useState } from "react";

const translations = {
    ua: {

        // --- CardsCheckResult
        ccrLearned_label: "Вивчено",
        ccrNotLearned_label: "Не вивчено",
        ccrTime_label: "Час",
        ccrAvgTime_label: "Середній час",
        ccrRetryButton_label: "Спробувати ще раз",

        // --- Footer
        footerCopy_label: "© 2026 kusottare team",
        footerAbout_label: "Про нас",
        footerHelp_label: "Допомога",
        footerLanguage_label: "English",

        // --- Header
        hdrSearchPlaceholder_label: "шукати будь-що",
        hdrNavMain_label: "Головна",
        hdrNavLibrary_label: "Бібліотека",
        hdrNavSaved_label: "Збережене",

        // --- ModuleCard
        moduleCardTerms_label: "термінів",
        moduleCardNoDescription_label: "Немає опису",
        moduleCardEdit_label: "Редагувати",
        moduleCardSave_label: "Зберегти",
        moduleCardUnsave_label: "Видалити зі збереженого",
        moduleCardPin_label: "Закріпити",
        moduleCardUnpin_label: "Відкріпити",
        moduleCardPermissions_label: "Дозволи",
        moduleCardAddToFolder_label: "Додати у папку",
        moduleCardExport_label: "Експорт / Імпорт",
        moduleCardMerge_label: "Об’єднати",
        moduleCardCancelMerge_label: "Скасувати об’єднання",
        moduleCardDelete_label: "Видалити",

        // --- ModuleImportExportModal
        mieHeaderImport_label: "Імпорт карток",
        mieHeaderManage_label: "Керування даними",
        mieTabExport_label: "Експорт",
        mieTabImport_label: "Імпорт",
        mieProcessing_label: "Обробка даних...",
        mieErrorInvalidFile_label: "Невірний формат. Підтримуються .csv, .xlsx, .xls",
        mieErrorParsing_label: "Помилка обробки файлу.",
        mieErrorNoData_label: "Не знайдено даних або невірний формат (очікується: Термін, Визначення)",
        mieSuccessUpdated_label: "Модуль успішно оновлено!",
        mieSuccessDownloaded_label: "Файл успішно завантажено",
        mieSuccessAddedCards_label: "Успішно додано {count} карток!",
        mieDescExport_label: "Завантажити картки:",
        mieDescImportLocal_label: "Дані з файлу будуть додані до поточного списку карток.",
        mieDescImportApi_label: "Оновіть модуль з файлу (.csv, .xlsx).",
        mieBtnSelectFile_label: "Вибрати файл",
        mieHintFormat_label: "Формат: Стовпець 1 (Термін), Стовпець 2 (Визначення)",
        mieExportSuccess_label: "Файл успішно завантажено ({format})",
        mieExportError_label: "Помилка експорту. Спробуйте пізніше.",
        mieImportSuccess_label: "Модуль успішно оновлено!",
        mieProcessingError_label: "Помилка обробки файлу.",
        mieErrorInvalidFormat_label: "Невірний формат. Підтримуються .csv, .xlsx, .xls",

        // --- PermissionsMenu
        pmHeader_label: "Керування доступом",
        pmSearch_placeholder: "Пошук користувача...",
        pmSearching_label: "Пошук...",
        pmNoUsers_label: "Користувачів не знайдено",
        pmLoading_label: "Завантаження прав...",
        pmOnlyYou_label: "Доступ має тільки ви",
        pmRemoveAccess_label: "Видалити доступ",
        pmDone_btn: "Готово",
        pmRoleEditor_label: "Редактор",

        // --- ProfileNav
        guest_label: "Гість",
        profile_created_label: "створено",
        profile_public_label: "Публічний профіль",
        profile_private_label: "Приватний профіль",
        profile_change_photo_label: "Змінити фото",
        profile_safety_label: "Безпека",
        profile_logout_label: "Вийти",
        profile_delete_label: "Видалити акаунт",

        // --- SearchField
        sfSearch_label: "Пошук",

        // --- SidePanel
        spNoPins_label: "Немає закріплених елементів",

        // --- SortMenu
        smSort_btn: "Сортувати",
        smByDate_label: "За датою",
        smByName_label: "За назвою",

        // --- TestResultCard
        trcDefinition_label: "Визначення",
        trcSelectAnswer_label: "Виберіть відповідь:",
        trcSkipped_label: "Пропущено",
        trcTryAgain_btn: "Спробувати ще раз",

        // --- TestQuestionCard
        tqcDefinition_label: "Визначення",
        tqcSelectAnswer_label: "Виберіть відповідь:",
        tqcSkip_btn: "Пропустити",

        // --- UserMenu
        umGuest_label: "Гість",
        umNotLoggedIn_label: "не увійшли",
        umSearch_placeholder: "шукати будь-що",
        umMain_label: "Головна",
        umLibrary_label: "Бібліотека",
        umFolders_label: "Папки",
        umPrivateProfile_label: "Приватний профіль",
        umPublicProfile_label: "Публічний профіль",
        umLanguage_label: "Мова",
        umEnglish_label: "Англійська",
        umSelectTheme_label: "Виберіть тему",
        umDarkTheme_label: "Темна тема",
        umLightTheme_label: "Світла тема",
        umCreateModule_label: "Створити модуль",
        umSwagger_label: "Swagger",
        umAdmin_label: "Admin",
        umSilk_label: "Silk",
        umFlower_label: "Flower",
        umLogout_label: "Вийти",
        umLogin_label: "Увійти",

        // --- AuthProvider
        authLoading_label: "Завантаження...",

        // --- AboutPage
        aboutHeader_title: "Про проєкт",
        aboutHeader_subtitle: "Дипломна робота студентів ВТФК",
        aboutHeader_group: "Група: 4КІ-21",
        teamMember1_name: "Войцех Євгеній",
        teamMember1_photo: "Фото розробника",
        teamMember2_name: "Чемін Дмитро",
        teamMember2_photo: "Фото розробника",
        teamMember_role: "Розробник",
        techStack_frontend: "Frontend Stack",
        techStack_backend: "Backend Stack",

        // --- GitHubCallback
        ghProcessing: "Обробка авторизації GitHub...",
        ghNoCode: "Немає коду авторизації. Переходимо на вхід...",
        ghSuccess: "Успішний вхід. Переходимо далі...",
        ghFailed: "Авторизація GitHub не вдалася. Переходимо на вхід...",

        // --- GoogleCallBack
        googleProcessing: "Обробка авторизації Google...",
        googleNoCode: "Немає коду авторизації. Переходимо на вхід...",
        googleSuccess: "Успішний вхід. Переходимо далі...",
        googleFailed: "Авторизація Google не вдалася. Переходимо на вхід...",

        // --- LoginPage
        loginTitle: "Вхід",
        username: "Ім'я користувача",
        password: "Пароль",
        forgotPassword: "Забули пароль?",
        loginBtn: "Увійти",
        or: "або",
        noAccount: "Ще немає акаунта?",
        register: "Зареєструватися",
        enterUsernamePassword: "Будь ласка, введіть ім'я користувача та пароль.",
        incorrectUsernamePassword: "Невірне ім'я користувача або пароль.",
        unexpectedError: "Сталася непередбачена помилка. Спробуйте ще раз.",
        LoginGoogleFailed: "Авторизація Google не вдалася. Спробуйте ще раз.",
        githubFailed: "Авторизація GitHub не вдалася. Спробуйте ще раз.",
        emailVerified: "Ваш акаунт успішно підтверджено!",
        emailVerifyFailed: "Підтвердження акаунта не вдалося. Спробуйте ще раз.",

        // --- PasswordReset
        passwordReset: "Скидання пароля",
        enterEmailForReset: "Введіть зареєстровану електронну адресу, на яку буде надіслано посилання для скидання пароля.",
        emailAddress: "Електронна адреса",
        sending: "Відправка...",
        send: "Відправити",
        enterNewPassword: "Введіть новий пароль",
        confirmNewPassword: "Підтвердіть новий пароль",
        saving: "Збереження...",
        apply: "Застосувати",
        didntReceiveEmail: "Не отримали лист?",
        sendAgain: "Відправити знову",
        enterRegisteredEmail: "Будь ласка, введіть зареєстровану електронну адресу",
        checkYourEmail: "Перевірте свою електронну пошту!",
        sendResetFailed: "Не вдалося надіслати лист для скидання пароля.",
        fillBothFields: "Будь ласка, заповніть обидва поля",
        passwordsDoNotMatch: "Паролі не співпадають",
        passwordResetSuccess: "Пароль успішно змінено!",
        passwordResetFailed: "Скидання пароля не вдалося.",

        // --- RegisterPage
        rpRegistration: "Реєстрація",
        rpUsernamePlaceholder: "Ім’я користувача",
        rpEmailPlaceholder: "Email (опційно)",
        rpPasswordPlaceholder: "Пароль",
        rpConfirmPasswordPlaceholder: "Підтвердіть пароль",
        rpPasswordsDoNotMatch: "Паролі не співпадають",
        rpUsernameTooLong: "Ім’я користувача має містити не більше 20 символів.",
        rpRegistrationSuccess: "Реєстрація успішна! Перевірте електронну пошту.",
        rpRegistrationFailed: "Помилка реєстрації. Перевірте свої дані.",
        rpAccountVerified: "Акаунт успішно підтверджено",
        rpProcessing: "Обробка...",
        rpOr: "або",
        rpAlreadyHaveAccount: "Вже маєте акаунт?",
        rpSignIn: "Увійти",
        rpGithubLogin: "Увійти через GitHub",
        rpGoogleLogin: "Увійти через Google",

        // --- CardsCheck
        ccLoading: "Завантаження...",
        ccNoCards: "У цьому модулі немає карток.",
        ccModuleLabel: "Модуль",

        // --- CardsTest
        ctLoading: "Завантаження карток...",
        ctNoCards: "Карток немає або модуль пустий",
        ctSendWarning: "Будь ласка, дайте відповіді на всі питання перед відправкою",
        ctModuleDefault: "Модуль тестування",
        ctSendBtn: "Відправити",

        // --- CreateModule
        cmErrorLoadingModule: "Помилка завантаження даних модуля.",
        cmOperationFailed: "Не вдалося зберегти модуль.",
        cmPracticeComingSoon: "Функція практики з’явиться незабаром",

        // --- ModuleForm
        mfCreateModuleTitle: "Створити новий модуль",
        mfEditModuleTitle: "Редагувати модуль",
        mfModuleNamePlaceholder: "Назва",
        mfModuleDescriptionPlaceholder: "Опис (опційно)",
        mfSelectLanguage: "Виберіть мову",
        mfSelectTopic: "Виберіть тему",
        mfNoTopicsAvailable: "Немає доступних тем",
        mfTermLabel: "Термін",
        mfDefinitionLabel: "Визначення",
        mfAddCard: "+ Додати картку",
        mfImportCards: "Імпорт",
        mfImportTitle: "Імпортувати CSV/XLSX для заповнення карток",
        mfDeeplTranslate: "DeepL",
        mfDeeplLoading: "Завантаження...",
        mfTranslateTargetLangFirst: "Будь ласка, спочатку виберіть цільову мову (праворуч).",
        mfEnterModuleName: "Будь ласка, введіть назву модуля",
        mfSelectLanguages: "Будь ласка, виберіть мови",
        mfAddAtLeastOneCard: "Будь ласка, додайте хоча б одну картку",
        mfRemoveCard: "Видалити картку",
        mfSaveButton: "Зберегти",
        mfCreateButton: "Створити",
        mfCloseButton: "Закрити",

        // --- FolderInfo
        fpErrorLoadingFolder: "Папку не знайдено або не вдалося завантажити.",
        fpDeleteFolderConfirm: "Видалити цю папку? Цю дію неможливо скасувати.",
        fpDeleteFolderError: "Не вдалося видалити папку.",
        fpChangeVisibilityError: "Не вдалося змінити видимість.",
        fpModuleVisibilityError: "Не вдалося змінити видимість модуля.",
        fpPinError: "Помилка при закріпленні.",
        fpAddUserError: "Не вдалося додати користувача.",
        fpRemoveUserError: "Не вдалося видалити користувача.",
        fpAddToFolderSuccess: "Модуль \"{moduleName}\" додано до папки \"{folderName}\"",
        fpAddToFolderError: "Не вдалося додати до папки.",
        fpNoModules: "Модулів ще немає",
        fpMergeModeBannerStrong: "Режим об'єднання",
        fpMergeModeBanner: "{count} модулів обрано. Натисніть на картки для вибору/скасування.",
        fpFinalizeMergeTitle: "Завершення об'єднання",
        fpNewNamePlaceholder: "Нова назва",
        fpSelectTopicPlaceholder: "Виберіть тему...",
        fpBackButton: "Назад",
        fpConfirmMergeButton: "Підтвердити",
        fpCloseButton: "Закрити",
        fpAddModuleButton: "Додати модуль",
        fpRenameLabel: "Перейменувати",
        fpDeleteLabel: "Видалити",
        fpMakePublicLabel: "Зробити публічною",
        mfMakePrivateLabel: "Зробити приватною",
        fpPinLabel: "Закріпити",
        fpUnpinLabel: "Відкріпити",
        fpRemoveFromFolderLabel: "Вилучити з папки",
        fpSaveButton: "Зберегти",
        fpCancelButton: "Скасувати",
        fpProcessButton: "Об'єднати",
        fpAddToFolderTitle: "Додати \"{moduleName}\" до:",
        fpNoFoldersFound: "Папок не знайдено.",
        fpMergeSuccess: "Модулі успішно об'єднано!",
        fpMergeError: "Не вдалося об'єднати модулі.",
        fpModalErrorTitle: "Помилка",
        fpModalSuccessTitle: "Успіх",
        fpModalAddedTitle: "Додано",

        // --- Folders
        fDeleteFolderConfirm: "Видалити цю папку? Цю дію не можна скасувати.",
        fCreateFolderError: "Помилка при створенні папки",
        fActionFailed: "Дія не виконана",
        fPinActionFailed: "Не вдалося закріпити/відкріпити папку",
        fDeleteFolderError: "Помилка при видаленні папки",
        fNoFoldersFound: "Папки не знайдено",
        fSaveButton: "Зберегти",
        fCancelButton: "Скасувати",
        fMakePublicLabel: "Зробити публічною",
        fMakePrivateLabel: "Зробити приватною",
        fRenameLabel: "Перейменувати",
        fPinLabel: "Закріпити",
        fUnpinLabel: "Відкріпити",
        fDeleteLabel: "Видалити",
        fSaveLabel: "Зберегти",
        fUnsaveLabel: "Видалити з обраного",
        fModulesLabel: "модулів",

        // --- Modules
        mDeleteModuleConfirm: "Видалити цей модуль? Цю дію не можна скасувати.",
        mErrorTitle: "Помилка",
        mSaveModuleFailed: "Не вдалося зберегти модуль.",
        mUnsaveModuleFailed: "Не вдалося видалити модуль із збережених.",
        mPinModuleFailed: "Не вдалося закріпити модуль.",
        mUnpinModuleFailed: "Не вдалося відкріпити модуль.",
        mDeleteModuleFailed: "Не вдалося видалити модуль.",
        mVisibilityChangeFailed: "Не вдалося змінити видимість модуля.",
        mAddUserFailed: "Не вдалося додати користувача.",
        mRemoveUserFailed: "Не вдалося видалити користувача.",
        mAddToFolderFailed: "Не вдалося додати модуль до папки.",
        mAddedTitle: "Додано",
        mAddedPrefix: "Додано модуль",
        mAddedToFolder: "до папки",
        mNoModulesYet: "У вас поки немає модулів.",
        mSelectTopicPlaceholder: "Виберіть тему...",
        mBackButton: "Назад",
        mConfirmMergeButton: "Підтвердити злиття",
        mMergeModeTitle: "Режим злиття:",
        mModulesSelected: "модулів вибрано.",
        mMergeClickInstruction: "Клікніть по картках для вибору/скасування вибору.",
        mErrorLoadingData: "Не вдалося завантажити ваші модулі.",

        // --- ModuleView
        mvDeleteModuleConfirm: "Видалити цей модуль? Цю дію не можна скасувати.",
        mvDeleteModuleFailed: "Не вдалося видалити модуль.",
        mvFailedAction: "Дія не вдалася.",
        mvFailedRate: "Не вдалося оцінити модуль.",
        mvErrorLoadModule: "Не вдалося завантажити модуль.",
        mvLearnedTitle: "Вивчені",
        mvInProgressTitle: "Ще в процесі",
        mvEmptyMessage: "Тут порожньо",
        mvRestartTitle: "Перезапуск",
        mvAutoTitle: "Авто",
        mvFullscreenTitle: "Повноекранний режим",
        mvCloseTitle: "Закрити",
        mvEditLabel: "Редагувати",
        mvCollaboratorsLabel: "Співавтори",
        mvDeleteLabel: "Видалити",

        // --- Cards
        cEmptyCardsMessage: "Тут поки порожньо",
        cFullscreenLabel: "На весь екран",
        cErrorLearnUpdate: "Не вдалося оновити статус вивчення",
        cErrorActionFailed: "Дія не вдалася",

        // --- Saves
        sSavesTitle: "Ваше збережене",
        sTabModules: "Модулі",
        sTabFolders: "Папки",
        sTabCards: "Картки",

        // --- Library
        lLibraryTitle: "Ваша бібліотека",
        lAddFolder: "Додати папку",
        lAddModule: "Додати модуль",
        lTabModules: "Модулі",
        lTabFolders: "Папки",

        // --- MainPage
        mpLatestViewed: "Останні переглянуті",
        mpLatestEmpty: "Ви ще нічого не переглядали",
        mpPopularModules: "Популярні модулі",
        mpPopularEmpty: "Популярних модулів поки немає",
        mpBestAuthors: "Найкращі автори",
        mpAuthorsEmpty: "Авторів не знайдено",
        mpWords: "слів",
        mpBy: "від",
        mpTerms: "термінів",
        mpModules: "модулів",
        mpModulesShort: "модулів",
        mpNoDescription: "Опис відсутній.",
        mpEmailVerifiedSuccess: "Електронну пошту успішно підтверджено!",
        mpEmailVerificationError: "Підтвердження електронної пошти не вдалося.",

        // --- PublicProfileLibrary
        pplModulesTab: "Модулі",
        pplFoldersTab: "Папки",
        pplNoModules: "Доступних модулів не знайдено.",
        pplNoFolders: "Доступних папок не знайдено.",
        pplSavedTitle: "Збережено",
        pplErrorTitle: "Помилка",
        pplModuleSaveSuccess: "Модуль успішно збережено.",
        pplModuleSaveError: "Не вдалося зберегти модуль.",
        pplModuleUnsaveError: "Не вдалося видалити модуль із збережених.",
        pplModulePinError: "Не вдалося закріпити модуль.",
        pplModuleUnpinError: "Не вдалося відкріпити модуль.",
        pplFolderPinError: "Помилка при закріпленні папки.",
        pplPin: "Закріпити",
        pplUnpin: "Відкріпити",
        pplExport: "Експорт",
        pplNoBio: "Опис профілю відсутній.",
        pplUserNotFoundError: "Користувача не знайдено або помилка з'єднання.",

        // --- ChangePhoto
        cpChangePhotoTitle: "Змінити фото",
        cpChangePhotoSubtitle: "Завантажте новий аватар",
        cpChoosePhotoBtn: "Вибрати фото",
        cpSavePhotoBtn: "Зберегти",
        cpUploadingPhotoBtn: "Завантаження...",
        cpDeletePhotoBtn: "Видалити",
        cpNoAvatarText: "немає",

        // --- DeleteAccount
        daDeleteAccountTitle: "Видалити акаунт",
        daDeleteAccountSubtitle: "Постійне видалення акаунта",
        daAttentionText: "Увага!",
        daAttentionDescription: "Якщо ви закриєте акаунт, ви назавжди втратите доступ до нього та всіх даних, навіть якщо в майбутньому створите новий акаунт з тією ж електронною поштою.",
        daDeleteAccountBtn: "Видалити",

        // --- PrivateProfile
        ppPrivateProfileTitle: "Приватний профіль",
        ppPrivateProfileSubtitle: "Додайте трохи інформації про себе",
        ppUsernameLabel: "Нікнейм",
        ppFirstNameLabel: "Ім'я",
        ppLastNameLabel: "Прізвище",
        ppDescriptionLabel: "Про себе",
        ppUsernameLengthError: "Нікнейм не може бути більше 20 символів.",
        ppProfileUpdatedMsg: "Профіль успішно оновлено.",

        // --- Safety
        sfSafetyTitle: "Безпека",
        sfSafetySubtitle: "Тут ви можете змінити електронну пошту або пароль",
        sfYourEmailLabel: "Ваша електронна пошта",
        sfEmailAdvice: "Введіть нову електронну пошту; на неї буде надіслано лист для підтвердження. Після підтвердження пошта буде оновлена.",
        sfSendEmailBtn: "Відправити",
        sfWaitEmailBtn: "Очікуйте...",
        sfVerificationEmailMsg: "Лист для підтвердження надіслано! Перевірте поштову скриньку.",
        sfEmailEmptyError: "Електронна пошта не може бути порожньою.",
        sfEmailActionFailed: "Не вдалося надіслати лист підтвердження.",
        sfYourPasswordLabel: "Поточний пароль",
        sfNewPasswordLabel: "Новий пароль",
        sfConfirmPasswordLabel: "Підтвердіть новий пароль",
        sfChangePasswordBtn: "Змінити пароль",
        sfForgotPasswordBtn: "Забули пароль?",
        sfAllFieldsError: "Усі поля повинні бути заповнені.",
        sfPasswordsMismatchError: "Паролі не співпадають.",
        sfPasswordChangedMsg: "Пароль успішно змінено!",
        sfChangePasswordFailed: "Не вдалося змінити пароль.",
        sfApiKeyStatusLabel: "Статус вашого DeepL API ключа",
        sfNoKeyLabel: "Немає ключа",
        sfActiveKeyLabel: "Активний ключ",
        sfCharsLeftLabel: "симв. залишилося",
        sfAddApiKeyLabel: "Додати DeepL API ключ",
        sfUpdateApiKeyLabel: "Оновити DeepL API ключ",
        sfEnterKeyPlaceholder: "Введіть ключ",
        sfEnterNewKeyPlaceholder: "Введіть новий ключ для оновлення",
        sfSaveKeyBtn: "Зберегти ключ",
        sfUpdateKeyBtn: "Оновити ключ",
        sfSavingKeyBtn: "Збереження...",
        sfDeletingKeyBtn: "Видалення...",
        sfDeleteKeyBtn: "Видалити DeepL ключ",
        sfApiKeyEmptyError: "API ключ не може бути порожнім.",
        sfApiKeyUpdatedSuccess: "DeepL ключ успішно оновлено.",
        sfApiKeyCreatedSuccess: "DeepL ключ успішно додано.",
        sfApiKeySaveFailed: "Не вдалося зберегти DeepL ключ.",
        sfApiKeyDeletedMsg: "DeepL ключ видалено.",
        sfApiKeyDeleteFailed: "Не вдалося видалити DeepL ключ.",
    },
};

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
    const [language, setLanguage] = useState("ua");

    const t = (key) => {
        return translations[language][key] || key;
    };

    const changeLanguage = (lang) => {
        if (translations[lang]) setLanguage(lang);
    };

    return (
        <I18nContext.Provider value={{ t, language, changeLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
