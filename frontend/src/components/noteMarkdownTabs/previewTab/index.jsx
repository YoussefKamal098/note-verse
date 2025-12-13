import React from 'react';
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';
import '@uiw/react-markdown-preview/markdown.css';
import './styles.css';

import {useTheme} from "@/contexts/ThemeContext";
import {createCodeRenderer} from './codeRenderer';
import {ImageRenderer} from './imageRenderer';
import {lazyMarkdownElements} from './lazyMarkdownElements';

const normalizeCodeBlocks = (markdown) => {
    return markdown.replace(/```(env|init)(\s)/g, '```ini$2');
};

const PreviewTab = ({content, ...props}) => {
    const {theme} = useTheme();
    const CodeRenderer = createCodeRenderer(theme);
    const {style = {}, ...restProps} = props;
    const {padding, ...restStyle} = style;

    return (
        <div {...restProps} style={restStyle} data-color-mode={theme}>
            <MarkdownPreview
                style={{...(padding ? {padding} : {})}}
                source={normalizeCodeBlocks(content)}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[[rehypeKatex, {throwOnError: false}]]}
                components={{
                    code: CodeRenderer,
                    img: ImageRenderer,
                    ...lazyMarkdownElements,
                }}
            />
        </div>
    );
};

export default React.memo(PreviewTab);
