import React, {Suspense} from 'react';
import {motion} from 'framer-motion';
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-preview/markdown.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'katex/contrib/mhchem';
import './customMarkdownStyles.css';
import {useTheme} from "@/contexts/ThemeContext";
import extractTextFromChildren from "@/utils/extractTextFromChildren";
import {directionAwareComponents} from "@/utils/langUtils";
import Loader from "@/components/common/Loader";

const Mermaid = React.lazy(() => import('@/components/mermaid'));
const Graph = React.lazy(() => import('@/components/graph'));

const normalizeCodeBlocks = (markdown) => {
    return markdown.replace(/```(env|init)(\s)/g, '```ini$2');
};

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

const imageRenderer = ({src, alt}) => (
    <motion.img
        src={src}
        alt={alt}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.3}}
        style={{
            backgroundColor: 'transparent',
            borderRadius: '10px',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0.5rem 0',
            fontWeight: "bold"
        }}
    />
);

const PreviewTab = ({content, ...props}) => {
    const {theme} = useTheme();
    const codeRenderer = createCodeRenderer(theme);

    const {style = {}, ...restProps} = props;
    const {padding, ...restStyle} = style;

    return (
        <div {...restProps} style={restStyle} data-color-mode={theme}>
            <MarkdownPreview
                style={{...(padding ? {padding: padding} : {})}}
                source={normalizeCodeBlocks(content)}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[[rehypeKatex, {throwOnError: false}]]}
                components={{
                    code: codeRenderer,
                    img: imageRenderer,
                    ...directionAwareComponents
                }}
            />
        </div>
    )
};

export default React.memo(PreviewTab);
