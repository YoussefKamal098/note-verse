import React from 'react';
import styled from "styled-components";
import MarkdownEditor from "@uiw/react-markdown-editor";
import '@uiw/react-markdown-editor/markdown-editor.css';
import "./customMarkdownStyles.css";
import {useTheme} from "@/contexts/ThemeContext";

const EditorStyled = styled(MarkdownEditor)`
    font-size: 0.9em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const EditorTab = ({
                       content,
                       onChange,
                       onKeyUp,
                       showToolbar = true,
                       disable = false
                       , ...props
                   }) => {
    const {theme} = useTheme();

    return (
        <div data-color-mode={theme} style={{height: "100%"}}>
            <EditorStyled
                {...props}
                value={content}
                placeholder="Enter your markdown content here..."
                onChange={onChange}
                onKeyUp={onKeyUp}
                onPaste={onKeyUp}
                showToolbar={showToolbar}
                editable={!disable}
                enablePreview={false}
            />
        </div>

    );
};

export default React.memo(EditorTab);
