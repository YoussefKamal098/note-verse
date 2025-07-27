import React, {useState, useMemo} from 'react';
import MarkdownEditor, {defaultCommands} from "@uiw/react-markdown-editor";
import '@uiw/react-markdown-editor/markdown-editor.css';
import "./styles.css";
import {useTheme} from "@/contexts/ThemeContext";

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

    const toolbars = useMemo(() => {
        const baseCommands = Object.values(defaultCommands).filter(
            cmd => (cmd.keyCommand !== 'fullscreen')
        );

        const dirToggleCommand = {
            name: 'direction-toggle',
            keyCommand: 'direction-toggle',
            icon: <span className="toolbar-item">{direction === 'rtl' ? 'LTR' : 'RTL'}</span>,
            button: {style: {padding: '0 17px'}},
            execute: () => setDirection((prev) => (prev === 'rtl' ? 'ltr' : 'rtl')),
        };

        return [...baseCommands, dirToggleCommand];
    }, [direction]);

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
