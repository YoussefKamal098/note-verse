import React, {useEffect, useMemo, useRef} from 'react';
import Prism from 'prismjs';

// Load core languages
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';

/**
 * NOTE: This component uses prefixed class names ('prism-prefix-*') to avoid
 * CSS class conflicts with other components in the application, particularly
 * the UIW Markdown component. All Prism-related classes are prefixed to ensure
 * style isolation while maintaining all syntax highlighting functionality.
 *
 * The prefix is applied to:
 * - All token classes (e.g., 'token' becomes 'prism-prefix-token')
 * - All language classes (e.g., 'language-js' becomes 'prism-prefix-language-js')
 * - All specific syntax token types (e.g., 'keyword', 'function', etc.)
 */
// Load themes
import "./themes/prism.css"
// import 'prismjs/themes/prism.css';
// import 'prismjs/themes/prism-tomorrow.css';

const PREFIX = 'prism-prefix'; // Your prefix constant
const LANGUAGES_MAP = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    hpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    rs: 'rust',
    scala: 'scala',
    sql: 'sql',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    json: 'json',
    md: 'markdown',
    markdown: 'markdown',
    mdx: 'markdown',
    html: 'markup',
    htm: 'markup',
    xml: 'markup',
    txt: 'text',
};

Prism.languages.text = {
    // Strings (single and double-quoted)
    string: {
        pattern: /(["'])(?:(?=(\\?))\2.)*?\1/,
        greedy: true
    },

    //number detection (integers and floats)
    'number': {
        pattern: /(?:\b\d+(?:\.\d+)+|\B\.\d+)(?:[eE][+-]?\d+)?[kKmMbBtT]?\b|\b\d+\b/,
        greedy: true
    },

    // Version numbers (v1.2, v2.11.000)
    'version': {
        pattern: /\bv\d+(?:\.\d+)+\b/i,
        alias: 'number',
        greedy: true
    },

    // Terms in square brackets
    'bracketed': {
        pattern: /\[[^\]]+\]/,
        greedy: true,
        alias: 'keyword'
    },

    // Separate pattern for abbreviated numbers
    'abbreviated-number': {
        pattern: /\b\d+(?:\.\d+)?[kKmMbBtT]\b/,
        alias: 'number',
        greedy: true
    },

    // Comments (// and # style)
    comment: /(\/\/[^\n]*|#[^\n]*)/,

    // Keywords
    keyword: /\b(function|if|else|for|while|return|class|import|export|const|let|var)\b/,

    // Operators
    operator: /([$=!<>]=?|&&|\|\||[+\-*/%])/,

    // Additional text-specific patterns
    'url': {
        pattern: /https?:\/\/[^\s]+/,
        greedy: true
    },
    'emphasis': /(\*[^*]+\*|_[^_]+_)/,
    'heading': /^#{1,6}\s+.+/m,

    // Added scientific notation support
    'scientific': {
        pattern: /\b\d+[eE][+-]?\d+\b/,
        alias: 'number'
    }
};

const SyntaxHighlighter = React.memo((
    {
        content,
        isComment,
        contentLang,
        filePath,
        darkMode
    }) => {
    const containerRef = useRef(null);

    const language = useMemo(() => {
        if (contentLang) {
            const normalizedLang = contentLang.toLowerCase();
            return LANGUAGES_MAP[normalizedLang] || normalizedLang;
        }

        if (!filePath) return 'text';
        const extension = filePath.split('.').pop().toLowerCase();
        return LANGUAGES_MAP[extension] || 'text';
    }, [contentLang, filePath]);

    const highlightedContent = useMemo(() => {
        // Handle standalone code block markers
        if (/^```(\w*)$/.test(content.trim()) || content.trim() === '```') {
            const langMatch = content.trim().match(/^```(\w*)$/);
            const lang = langMatch ? langMatch[1] : '';
            return `<span class="code-block${lang ? ` language-${lang}` : ''}">${content}</span>`;
        }

        // If it's a comment line, wrap it in comment tags directly
        if (isComment) {
            return `<span class="token comment">${content}</span>`;
        }

        try {
            // Try to require the language if not loaded
            if (!Prism.languages[language]) {
                try {
                    require(`prismjs/components/prism-${language}`);
                } catch (e) {
                    console.warn(`Prism language component not found: ${language}`);
                    return content;
                }
            }

            return Prism.highlight(content, Prism.languages[language], language);
        } catch (e) {
            console.error('Syntax highlighting failed:', e);
            return content;
        }
    }, [content, language, isComment]);


    useEffect(() => {
        if (!containerRef.current) return;

        const prefixClasses = (element) => {
            if (element.classList) {
                const classes = Array.from(element.classList);
                classes.forEach(cls => {
                    // Prefix Prism-related classes only
                    if (cls.startsWith('token') || cls.startsWith('language-')) {
                        element.classList.remove(cls);
                        element.classList.add(`${PREFIX}-${cls}`);
                    }
                });
            }

            // Process all child elements
            Array.from(element.children).forEach(child => {
                prefixClasses(child);
            });
        };

        // Run after the highlighted content is rendered
        prefixClasses(containerRef.current);
    }, [highlightedContent]);

    return (
        <span
            ref={containerRef}
            className={`language-${language} prism-theme-container`}
            data-prism-theme={darkMode ? 'dark' : 'light'}
            dangerouslySetInnerHTML={{__html: highlightedContent}}
        />
    );
});

export default SyntaxHighlighter;
