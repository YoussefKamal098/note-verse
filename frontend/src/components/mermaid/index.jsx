import React, {useEffect, useRef, useState} from 'react';
import styled from "styled-components";
import {MermaidDiagram} from '@lightenna/react-mermaid-diagram';
import {useZoomPan} from "@/hooks/useZoomPan";

const Error = styled.div`
    padding: 10px;
    color: var(--color-danger);
    font-family: "Quicksand", "Poppins", sans-serif !important;
    font-weight: 600;
    white-space: wrap;
    word-break: break-word;
`

const DiagramContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: grab;

    &:active {
        cursor: grabbing;
    }
`;

const DiagramWrapper = styled.div`
    transform-origin: 0 0;
    will-change: transform;
    width: fit-content;
    height: fit-content;

    .nodeLabel,
    .messageText,
    .actor,
    .actor-box,
    .titleText {
        font-size: 0.8rem !important;
        font-family: "Quicksand", "Poppins", sans-serif !important;
        font-weight: 600 !important;
    }
`;


const Mermaid = ({chart, theme}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [hasError, setHasError] = useState(null);
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);

    useZoomPan(containerRef, wrapperRef, [chart, theme]);

    useEffect(() => {
        setIsMounted(true);
        setHasError(null);

        const errorObserver = new MutationObserver(() => {
            document.querySelectorAll('svg text.error-text')
                .forEach(el => {
                    if (!containerRef.current?.contains(el)) {
                        const parent = el.closest('div');
                        if (parent) parent.remove();
                    }
                });
        });

        errorObserver.observe(document.body, {childList: true, subtree: true});

        return () => {
            errorObserver.disconnect();
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
                <Error>{hasError.message || String(hasError)}</Error>
            )}
            {!hasError && (
                <DiagramContainer ref={containerRef}>
                    <DiagramWrapper ref={wrapperRef}>
                        <MermaidDiagram
                            theme={theme}
                            securityLevel="strict"
                            onError={handleError}
                        >
                            {chart}
                        </MermaidDiagram>
                    </DiagramWrapper>
                </DiagramContainer>
            )}
        </>
    );
};

export default React.memo(Mermaid);
