import React from 'react';
import MarkdownEditor from "@uiw/react-markdown-editor";
import styled from "styled-components";

const EditorStyled = styled(MarkdownEditor)`
    font-size: 0.9em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const EditorTab = React.memo(({content, onChange, onKeyUp}) => {
    return (
        <EditorStyled
            value={content}
            placeholder="Enter your markdown content here..."
            onChange={onChange}
            onKeyUp={onKeyUp}
            onPaste={onKeyUp}
            enablePreview={false}
        />
    );
});

export default React.memo(EditorTab);
