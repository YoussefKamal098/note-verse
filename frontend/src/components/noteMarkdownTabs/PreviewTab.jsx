import React from 'react';
import MarkdownPreview from "@uiw/react-markdown-preview";
import styled from "styled-components";

const PreviewStyled = styled(MarkdownPreview)`
    text-align: left;
    padding: 1em 2em 3em;
    font-size: 1em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const PreviewTab = React.memo(({content}) => {
    return <PreviewStyled source={content}/>;
});

export default React.memo(PreviewTab);
