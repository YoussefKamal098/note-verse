import extractTextFromChildren from "@/utils/extractTextFromChildren";

// Detects direction (LTR/RTL) based on first strong character using Unicode script detection
export function detectLangDirection(text) {
    const rtlPattern = /\p{Script=Hebrew}|\p{Script=Arabic}|\p{Script=Syriac}|\p{Script=Thaana}|\p{Script=Nko}/u;

    if (rtlPattern.test(text)) return 'rtl';
    return 'ltr'; // default fallback
}

export function detectLangCode(text) {
    const rtlLangs = [
        {pattern: /\p{Script=Arabic}/u, lang: 'ar'},
        {pattern: /\p{Script=Hebrew}/u, lang: 'he'},
        {pattern: /\p{Script=Syriac}/u, lang: 'syc'},
        {pattern: /\p{Script=Thaana}/u, lang: 'dv'},
        {pattern: /\p{Script=Nko}/u, lang: 'nqo'},
    ];

    for (const {pattern, lang} of rtlLangs) {
        if (pattern.test(text)) return lang;
    }

    // Default fallback
    return 'en';
}

// Generic direction-aware wrapper
export const autoDir = (Tag) => ({node, children, ...props}) => {
    const text = extractTextFromChildren(children);
    const dir = detectLangDirection(text);
    const lang = detectLangCode(text);

    return <Tag dir={dir} lang={lang} {...props}>{children}</Tag>;
};
