import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import {MermaidDiagram} from '@lightenna/react-mermaid-diagram';

const Error = styled.pre`
    color: var(--color-danger);
    font-family: "Quicksand", "Poppins", sans-serif !important;
    font-weight: 600;
    white-space: pre-wrap;
`

const Container = styled.div`
    .nodeLabel,
    .messageText,
    .actor,
    .actor-box,
    .titleText {
        font-size: 0.8rem !important;
        font-family: "Quicksand", "Poppins", sans-serif !important;
        font-weight: 600 !important;
    }
`

const Mermaid = ({chart, theme}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [hasError, setHasError] = useState(null);

    useEffect(() => {
        setIsMounted(true);
        setHasError(null);

        // Observe the DOM and remove injected Mermaid error diagrams (SVG elements with error messages).
        // This handles cases where Mermaid renders an SVG with embedded <text class="error-text">Syntax error in text</text>
        // when the diagram syntax is invalid. We remove the entire parent div to prevent the error from showing visually.
        const observer = new MutationObserver(() => {
            document.querySelectorAll('svg[id*="mermaid-svg"] text.error-text').forEach((el) => {
                const parent = el.closest('div[id*="mermaid-svg"]');
                if (parent) parent.remove(); // remove whole injected diagram
            });
        });

        observer.observe(document.body, {childList: true, subtree: true});

        return () => {
            observer.disconnect();
            setIsMounted(false);
        };
    }, [chart, theme]);

    const handleError = (error) => {
        setHasError(error);
    };


    if (!isMounted) return null;

    return (
        <>
            {hasError && (
                <Error>
                    Mermaid diagram error: {hasError.message || String(hasError)}
                </Error>
            )}
            {!hasError && (
                <Container>
                    <MermaidDiagram
                        securityLevel="strict"
                        theme={theme}
                        onError={handleError}
                    >
                        {chart}
                    </MermaidDiagram>
                </Container>
            )}
        </>
    );
};

export default React.memo(Mermaid);
