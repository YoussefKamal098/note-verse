import React, {useMemo} from 'react';
import {detectLangDirection, detectLangCode} from "@/utils/langUtils";
import {highlightWordDiffs} from './WordDiff';
import SyntaxHighlighter from './SyntaxHighlighter';


/**
 * IMPORTANT NOTE ABOUT WORD DIFF IMPLEMENTATION:
 *
 * The current word-level diff implementation (highlightWordDiffs) is a basic version
 * that needs significant improvements to:
 *
 * 1. Handle complex syntax cases correctly (especially with syntax highlighting)
 * 2. Properly align diffs across multiple lines
 * 3. Maintain original formatting and whitespace
 * 4. Handle special characters and code syntax boundaries
 * 5. Work consistently across different programming languages
 *
 * Current limitations:
 * - May break syntax highlighting in some cases
 * - Doesn't properly handle multiline tokens
 * - May produce suboptimal diff segments
 * - Performance could be improved for large files
 */


const renderContent = (content, isComment, contentLang, filePath, darkMode) => {
    if (typeof content === 'string') {
        return <SyntaxHighlighter
            content={content}
            contentLang={contentLang}
            isComment={isComment}
            filePath={filePath}
            darkMode={darkMode}
        />;
    }

    if (Array.isArray(content) && content.every(part => typeof part === 'string')) {
        return <SyntaxHighlighter
            content={content.join("")}
            contentLang={contentLang}
            isComment={isComment}
            filePath={filePath}
            darkMode={darkMode}
        />;
    }

    if (Array.isArray(content)) {
        return content.map((part, i) => {
            if (typeof part === 'string') {
                return <SyntaxHighlighter
                    key={i} content={part}
                    contentLang={contentLang}
                    isComment={isComment}
                    filePath={filePath}
                    darkMode={darkMode}
                />;
            }
            return (
                <span key={i} className={`diff-viewer-word-${part.type}`}>
                   <SyntaxHighlighter
                       content={part.text}
                       contentLang={contentLang}
                       isComment={isComment}
                       filePath={filePath}
                       darkMode={darkMode}
                   />
                </span>
            );
        });
    }

    return <SyntaxHighlighter
        content={String(content)}
        contentLang={contentLang}
        isComment={isComment}
        filePath={filePath}
        darkMode={darkMode}
    />;
};

const Line = React.memo((
    {
        line,
        isComment,
        lineLang,
        showWordDiff,
        nextLine,
        prevLine,
        filePath,
        darkMode
    }) => {
    const content = useMemo(() => {
        if (!showWordDiff) {
            return line.content;
        }

        if (line.type === 'delete' && nextLine?.type === 'insert') {
            const {old} = highlightWordDiffs(line.content, nextLine.content);
            return old || line.content;
        }

        if (line.type === 'insert' && prevLine?.type === 'delete') {
            const {new: newContent} = highlightWordDiffs(prevLine.content, line.content);
            return newContent || line.content;
        }

        return line.content;
    }, [line, showWordDiff, nextLine, prevLine]);

    const dir = detectLangDirection(content);
    const lang = detectLangCode(content);

    return (
        <div className={`diff-viewer-line diff-viewer-${line.type}`}>
            <span className="diff-viewer-line-number old">{line.oldLine || ''}</span>
            <span className="diff-viewer-line-number new">{line.newLine || ''}</span>
            <span className="diff-viewer-line-marker">
              {line.type === 'insert' ? '+' : line.type === 'delete' ? '-' : ' '}
            </span>
            <span className="diff-viewer-line-content" dir={dir} lang={lang}>
              {renderContent(content, isComment, lineLang, filePath, darkMode)}
            </span>
        </div>
    );
});

export default Line;
