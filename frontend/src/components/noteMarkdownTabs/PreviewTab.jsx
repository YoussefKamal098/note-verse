import React from 'react';
import styled from "styled-components";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {useTheme} from "../../contexts/ThemeContext";

const PreviewStyled = styled(MarkdownPreview)`
    text-align: left;
    padding: 1em 2em 3em;
    font-size: 1em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const PreviewTab = React.memo(({content}) => {
    const {theme} = useTheme();

    return (
        <div data-color-mode={theme}>
            <PreviewStyled source={content}/>
        </div>
    )
});

export default React.memo(PreviewTab);
