import React, {useRef, useEffect} from 'react';
import styled from 'styled-components';
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-preview/markdown.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';
import './customMarkdownStyles.css';
import extractTextFromChildren from "@/utils/extractTextFromChildren";
import Mermaid from '@/components/mermaid';
import {useTheme} from "@/contexts/ThemeContext";

import functionPlot from 'function-plot';

const FunctionGraph = ({equation}) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        try {
            functionPlot({
                target: ref.current,
                width: 500,
                height: 300,
                grid: true,
                data: [{
                    fn: equation,
                    graphType: 'polyline',
                }],
                disableZoom: false,
            });
        } catch (err) {
            ref.current.innerHTML = "Invalid equation";
        }
    }, [equation]);

    return <div ref={ref}/>;
};

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
            <PreviewStyles
                source={content}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[[rehypeKatex, {throwOnError: false}]]}
                components={{
                    code({node, inline, className = '', children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const code = extractTextFromChildren(children).trim();

                        if (match?.[1] === 'mermaid') {
                            return <Mermaid theme={theme} chart={code}/>;
                        }

                        if (match?.[1] === 'graph') {
                            return <FunctionGraph equation={code}/>;
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            />
        </div>
    )
};

export default React.memo(PreviewTab);
