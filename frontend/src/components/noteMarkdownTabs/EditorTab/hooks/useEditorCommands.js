import {useCallback} from "react";
import {MARKDOWN_COMMANDS} from "../constants/commands";

const useEditorCommands = ({editorRef, onCommandExecuted}) => {
    return useCallback((action) => {
        const editor = editorRef.current;
        if (!editor) return;

        const selection = editor.getSelection();
        const text = editor.getModel().getValueInRange(selection);
        const transform = MARKDOWN_COMMANDS[action];
        if (!transform) return;

        editor.executeEdits("markdown-cmd", [{
            range: selection,
            text: transform(text),
            forceMoveMarkers: true,
        }]);
        editor.focus();
        onCommandExecuted?.(editor.getValue());
    }, [editorRef]);
};

export default useEditorCommands;
