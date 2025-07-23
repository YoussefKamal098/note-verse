import React, {useState, useMemo} from 'react';
import MarkdownEditor, {defaultCommands} from "@uiw/react-markdown-editor";
import '@uiw/react-markdown-editor/markdown-editor.css';
import "./customMarkdownStyles.css";
import {useTheme} from "@/contexts/ThemeContext";

delete defaultCommands.fullscreen;

const EditorTab = ({
                       content,
                       onChange,
                       onKeyUp,
                       showToolbar = true,
                       disable = false,
                       ...props
                   }) => {
    const {theme} = useTheme();
    const [direction, setDirection] = useState("ltr");
    const toolbars = useMemo(() => [
        ...Object.values(defaultCommands),
        {
            name: "direction-toggle",
            keyCommand: "direction-toggle",
            icon: <span style={{
                fontSize: "0.85em",
                fontWeight: "bold",
                width: "2em"
            }}>{direction === "rtl" ? "LTR" : "RTL"}</span>,
            execute: () => {
                setDirection(prev => (prev === "rtl" ? "ltr" : "rtl"));
            }
        }
    ], [direction]);

    return (
        <div data-color-mode={theme} style={{height: "100%"}}>
            <MarkdownEditor
                {...props}
                style={{
                    direction,
                    textAlign: direction === "rtl" ? "right" : "left",
                }}
                value={content}
                placeholder="Enter your markdown content here..."
                onChange={onChange}
                onKeyUp={onKeyUp}
                onPaste={onKeyUp}
                showToolbar={showToolbar}
                toolbars={toolbars}
                editable={!disable}
                enablePreview={false}
            />
        </div>
    );
};

export default React.memo(EditorTab);
