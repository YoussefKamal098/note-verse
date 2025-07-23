// Helper function to detect comment blocks
const handleCommentBlocks = (line, inCommentBlock) => {
    const isCommentStart = line.trimStart().startsWith('/*') ||
        line.trimStart().startsWith('"""') ||
        line.trimStart().startsWith("'''");

    const isCommentEnd = line.trimEnd().endsWith('*/') ||
        line.trimEnd().endsWith('"""') ||
        line.trimEnd().endsWith("'''");

    if (isCommentStart && !isCommentEnd) {
        return {inCommentBlock: true, isCommentLine: true};
    } else if (isCommentEnd) {
        return {inCommentBlock: false, isCommentLine: true};
    } else if (inCommentBlock) {
        return {inCommentBlock: true, isCommentLine: true};
    }

    return {inCommentBlock: false, isCommentLine: false};
};

// Helper function to process diff markers
const processDiffMarkers = (line) => {
    let type = 'normal';
    let content = line;

    if (line.startsWith('+')) {
        type = 'insert';
        content = line.substring(1);
    } else if (line.startsWith('-')) {
        type = 'delete';
        content = line.substring(1);
    } else if (line.startsWith(' ')) {
        content = line.substring(1);
    }

    return {type, content};
};

// Helper function to handle code blocks in Markdown
const handleCodeBlocks = (content, isMarkdownFile, inCodeBlock, currentLanguage) => {
    let lineLang = null;
    let newInCodeBlock = inCodeBlock;
    let newCurrentLanguage = currentLanguage;

    if (isMarkdownFile) {
        const codeBlockMatch = content.match(/^\s*```(\w*)/);
        if (codeBlockMatch) {
            if (inCodeBlock) {
                // End of code block
                newInCodeBlock = false;
                newCurrentLanguage = null;
            } else {
                // Start of code block
                newInCodeBlock = true;
                newCurrentLanguage = codeBlockMatch[1] || null;
            }
        }

        if (newInCodeBlock && newCurrentLanguage) {
            lineLang = newCurrentLanguage;
        }
    }

    return {lineLang, inCodeBlock: newInCodeBlock, currentLanguage: newCurrentLanguage};
};

// Main diff parsing function
export const parseDiffText = (text) => {
    const files = [];
    let currentFile = null;
    let currentHunk = null;
    let lineCounter = 0;
    let inCodeBlock = false;
    let currentLanguage = null;
    let isMarkdownFile = false;
    let inCommentBlock = false;

    const lines = text.split('\n');

    for (const line of lines) {
        lineCounter++;

        // Check if the file is Markdown
        if (line.startsWith('--- ') || line.startsWith('+++ ')) {
            const path = line.substring(4).trim();
            isMarkdownFile = path.endsWith('.md') || path.endsWith('.markdown');
        }

        // Handle file headers
        if (line.startsWith('--- ')) {
            if (currentFile) files.push(currentFile);
            currentFile = {
                oldPath: line.substring(4).trim(),
                newPath: '',
                hunks: [],
                lineCount: 0,
                isMarkdown: false
            };
        } else if (line.startsWith('+++ ')) {
            if (currentFile) {
                currentFile.newPath = line.substring(4).trim();
                currentFile.isMarkdown = currentFile.newPath.endsWith('.md') ||
                    currentFile.newPath.endsWith('.markdown');
            }
        }
        // Handle hunk headers
        else if (line.startsWith('@@ ')) {
            if (currentFile) {
                if (currentHunk) currentFile.hunks.push(currentHunk);
                const hunkHeader = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
                currentHunk = {
                    oldStart: parseInt(hunkHeader[1]),
                    oldLines: parseInt(hunkHeader[2] || 1),
                    newStart: parseInt(hunkHeader[3]),
                    newLines: parseInt(hunkHeader[4] || 1),
                    changes: [],
                    startLine: lineCounter,
                    endLine: lineCounter
                };
            }
        }
        // Handle content lines
        else if (currentHunk) {
            currentHunk.endLine = lineCounter;

            // Process diff markers and comment blocks
            const {type, content} = processDiffMarkers(line);
            const {inCommentBlock: newInCommentBlock, isCommentLine} =
                handleCommentBlocks(content, inCommentBlock);
            inCommentBlock = newInCommentBlock;

            // Handle code blocks in Markdown
            const {lineLang, inCodeBlock: newInCodeBlock, currentLanguage: newCurrentLanguage} =
                handleCodeBlocks(content, currentFile?.isMarkdown, inCodeBlock, currentLanguage);
            inCodeBlock = newInCodeBlock;
            currentLanguage = newCurrentLanguage;

            currentHunk.changes.push({
                type,
                content,
                isComment: isCommentLine,
                ...(lineLang && {lineLang})
            });

            if (currentFile) currentFile.lineCount++;
        }
    }

    // Push any remaining file data
    if (currentFile) {
        if (currentHunk) currentFile.hunks.push(currentHunk);
        files.push(currentFile);
    }

    return files;
};
