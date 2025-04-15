import React from 'react';
import styled from "styled-components";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {useTheme} from "../../contexts/ThemeContext";

const EditorStyled = styled(MarkdownEditor)`
    font-size: 0.9em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const EditorTab = React.memo(({content, onChange, onKeyUp}) => {
    const {theme} = useTheme();

    return (
        <div data-color-mode={theme}>
            <EditorStyled
                value={content}
                placeholder="Enter your markdown content here..."
                onChange={onChange}
                onKeyUp={onKeyUp}
                onPaste={onKeyUp}
                enablePreview={false}
            />
        </div>

    );
});

export default React.memo(EditorTab);
