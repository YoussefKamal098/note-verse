export const getEditorOptions = (disable) => ({
    readOnly: disable,
    minimap: {enabled: false},
    wordWrap: "on",
    automaticLayout: true,
    fontSize: 13,
    folding: true,
    foldingStrategy: "indentation",
    // showFoldingControls: "always",
    bracketPairColorization: {enabled: true},
    guides: {bracketPairs: true},
    cursorBlinking: "smooth",
    // Indentation settings
    autoIndent: "full",
    formatOnType: true,
    formatOnPaste: true,
    trimAutoWhitespace: true,
    // Tab settings
    tabSize: 2,
    insertSpaces: true,
    // Auto-completion settings
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    snippetSuggestions: "inline",
    quickSuggestions: {
        other: true,
        comments: true,
        strings: true
    },
    // Additional editor features
    // scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    renderWhitespace: "selection",
    links: true,
    contextmenu: false,
    // Language specific
    wordBasedSuggestions: "allDocuments",
    suggest: {
        showWords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showConstants: true,
    }
});
