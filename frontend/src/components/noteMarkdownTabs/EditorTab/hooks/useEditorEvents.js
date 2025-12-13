import {useCallback, useEffect, useRef} from "react";
import * as monaco from "monaco-editor";

const useEditorEvents = (editorRef, {onKeyUp, onPaste}) => {
    const disposables = useRef([]);

    const setupAutoList = useCallback((editor) => {
        editor.onKeyDown((e) => {
            if (e.code !== "Enter") return;

            const model = editor.getModel();
            const pos = editor.getPosition();
            const line = model.getLineContent(pos.lineNumber);

            // Unordered list
            if (/^\s*-\s/.test(line)) {
                e.preventDefault();
                editor.trigger("keyboard", "type", {text: "\n- "});
            }

            // Ordered list
            if (/^\s*\d+\.\s/.test(line)) {
                const match = line.match(/^(\s*)(\d+)\.\s/);
                if (!match) return;
                const next = Number(match[2]) + 1;
                e.preventDefault();
                editor.trigger("keyboard", "type", {text: `\n${match[1]}${next}. `});
            }
        });
    }, []);

    const setupWheelZoom = useCallback((editor) => {
        const node = editor.getDomNode();
        const zoomWheel = (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            const size = editor.getOption(monaco.editor.EditorOption.fontSize);
            const delta = e.deltaY < 0 ? 1 : -1;
            editor.updateOptions({fontSize: size + delta});
        };
        node.addEventListener("wheel", zoomWheel, {passive: false});
        return () => node.removeEventListener("wheel", zoomWheel);
    }, []);

    const onMount = useCallback((editor) => {
        editorRef.current = editor;

        setupAutoList(editor);

        disposables.current.push(
            editor.onKeyUp(() => onKeyUp?.(editor.getValue())),
            editor.onDidPaste((e) => onPaste?.(e)),
            {dispose: setupWheelZoom(editor)}
        );
    }, [onKeyUp, onPaste, editorRef, setupAutoList, setupWheelZoom]);

    useEffect(() => {
        return () => {
            disposables.current.forEach((d) => d.dispose?.());
            disposables.current = [];
            editorRef.current?.dispose();
        };
    }, [editorRef]);

    return {onMount};
};

export default useEditorEvents;
