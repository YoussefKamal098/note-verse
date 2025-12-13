import React, {useRef, useMemo} from "react";
import {useTheme} from "@/contexts/ThemeContext";
import Editor from "@monaco-editor/react";
import Tooltip from "@/components/tooltip/Tooltip";
import LoadingEffect from "@/components/common/Loader";
import useEditorCommands from "./hooks/useEditorCommands";
import useEditorEvents from "./hooks/useEditorEvents";
import {MARKDOWN_COMMANDS} from "./constants/commands";
import {COMMAND_ICONS} from "./constants/icons";
import {getEditorOptions} from "./editorOptions";
import "./styles.css";

const EditorTab = React.memo(({
                                  content,
                                  onChange,
                                  onKeyUp,
                                  onPaste,
                                  disable = false,
                                  showToolbar = true,
                                  ...props
                              }) => {
    const {theme} = useTheme();
    const editorRef = useRef(null);
    const applyCommand = useEditorCommands({editorRef, onCommandExecuted: onKeyUp});
    const {onMount} = useEditorEvents(editorRef, {onKeyUp, onPaste});
    const options = useMemo(() => getEditorOptions(disable), [disable]);

    return (
        <div className="editor-wrapper">
            {showToolbar && (
                <div className="editor-toolbar">
                    {Object.keys(MARKDOWN_COMMANDS).map(cmd => {
                        const Icon = COMMAND_ICONS[cmd];
                        return (
                            <Tooltip key={cmd} title={cmd}>
                                <button onClick={() => applyCommand(cmd)} className="editor-btn">
                                    {Icon && <Icon size={15}/>}
                                </button>
                            </Tooltip>
                        );
                    })}
                </div>
            )}

            <Editor
                {...props}
                language="markdown"
                value={content}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                onChange={onChange}
                onMount={onMount}
                options={options}
                loading={<div className="editor-loader"><LoadingEffect isAbsolute/></div>}
            />
        </div>
    );
});

export default React.memo(EditorTab);
