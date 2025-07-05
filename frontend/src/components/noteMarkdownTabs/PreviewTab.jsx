import React, {Suspense} from 'react';
import styled from 'styled-components';
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-preview/markdown.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';
import './customMarkdownStyles.css';
import {useTheme} from "@/contexts/ThemeContext";
import extractTextFromChildren from "@/utils/extractTextFromChildren";
import Loader from "@/components/common/Loader";

const Mermaid = React.lazy(() => import('@/components/mermaid'));
const Graph = React.lazy(() => import('@/components/graph'));

const PreviewStyles = styled(MarkdownPreview)`
    padding: 1em 2em 3em;
    text-align: left;
    font-size: 1em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
    background-color: transparent !important;
`;

// Custom Code Block Renderer
const createCodeRenderer = (theme) => ({node, inline, className = '', children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    const code = extractTextFromChildren(children).trim();

    if (!match) {
        return <code className={className} {...props}>{children}</code>;
    }

    const language = match[1];
    const components = {
        mermaid: <Mermaid theme={theme} chart={code}/>,
        graph: <Graph expressions={code}/>
    };

    if (components[language]) {
        return (
            <Suspense fallback={<Loader size={20} isAbsolute={true}/>}>
                {components[language]}
            </Suspense>
        );
    }

    return <code className={className} {...props}>{children}</code>;
};


const PreviewTab = ({content, ...props}) => {
    const {theme} = useTheme();
    const codeRenderer = createCodeRenderer(theme);

    return (
        <div {...props} data-color-mode={theme}>
            <PreviewStyles
                source={content}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[[rehypeKatex, {throwOnError: false}]]}
                components={{code: codeRenderer}}
            />
        </div>
    )
};

export default React.memo(PreviewTab);
