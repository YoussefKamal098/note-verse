import React from 'react';
import styled from 'styled-components';
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-preview/markdown.css';
import './customMarkdownStyles.css';
import {useTheme} from "@/contexts/ThemeContext";

const PreviewStyles = styled(MarkdownPreview)`
    padding: 1em 2em 3em;
    text-align: left;
    font-size: 1em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
    background-color: transparent !important;
`;

const PreviewTab = ({content, ...props}) => {
    const {theme} = useTheme();

    return (
        <div {...props} data-color-mode={theme}>
            <PreviewStyles source={content}/>
        </div>
    )
};

export default React.memo(PreviewTab);
