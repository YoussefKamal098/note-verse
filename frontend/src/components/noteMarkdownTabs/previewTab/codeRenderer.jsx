import React, {Suspense} from 'react';
import Loader from "@/components/common/Loader";
import useLazyVisible from "@/hooks/useLazyVisible";
import extractTextFromChildren from "@/utils/extractTextFromChildren";

const Mermaid = React.lazy(() => import('@/components/mermaid'));
const Graph = React.lazy(() => import('@/components/graph'));

export const createCodeRenderer = (theme) => ({node, inline, className = '', children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    const code = extractTextFromChildren(children).trim();
    const [ref, visible] = useLazyVisible();

    if (!match) {
        return (<span ref={ref}>
        {visible &&
            <code className={className} {...props}>
                {children}
            </code>}
        </span>);
    }

    const language = match[1];
    const components = {
        mermaid: <Mermaid theme={theme} chart={code}/>,
        graph: <Graph expressions={code}/>,
    };

    if (components[language]) {
        return (
            <div ref={ref}>
                {visible && (<pre className={className} {...props}>
                    <Suspense fallback={<Loader size={20} isAbsolute={true}/>}>
                        {components[language]}
                    </Suspense>
                </pre>)}
            </div>
        );
    }

    return (
        <div ref={ref}>
            {visible && (<pre className={className} {...props}>
                <code>{children}</code>
            </pre>)}
        </div>
    );
};
