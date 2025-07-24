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
export const AutoDir = (Tag) => ({node, children, ...props}) => {
    const text = extractTextFromChildren(children);
    const dir = detectLangDirection(text);
    const lang = detectLangCode(text);

    return <Tag dir={dir} lang={lang} {...props}>{children}</Tag>;
};


// Exporting components map
export const directionAwareComponents = {
    // Block-level elements
    p: AutoDir('p'),
    h1: AutoDir('h1'),
    h2: AutoDir('h2'),
    h3: AutoDir('h3'),
    h4: AutoDir('h4'),
    h5: AutoDir('h5'),
    h6: AutoDir('h6'),
    ul: AutoDir('ul'),
    ol: AutoDir('ol'),
    li: AutoDir('li'),
    pre: AutoDir('pre'),
    blockquote: AutoDir('blockquote'),
    table: AutoDir('table'),
    thead: AutoDir('thead'),
    tbody: AutoDir('tbody'),
    tr: AutoDir('tr'),
    th: AutoDir('th'),
    td: AutoDir('td'),
    dl: AutoDir('dl'),
    dt: AutoDir('dt'),
    dd: AutoDir('dd'),

    // Inline elements
    // span: AutoDir('span'),
    // strong: AutoDir('strong'),
    // em: AutoDir('em'),
    // del: AutoDir('del'),
};
