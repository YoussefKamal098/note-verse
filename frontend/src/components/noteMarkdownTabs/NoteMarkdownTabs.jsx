import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useState} from "react";
import styled from "styled-components";
import {HiOutlineWrenchScrewdriver} from "react-icons/hi2";
import {FaBookOpenReader} from "react-icons/fa6";
import useDebounce from "../../hooks/useDebounce";
import DynamicTabs from "../dynamicTabs/DynamicTabs";
import PreviewTab from "./previewTab";
import EditorTab from "./EditorTab";

const NoteMarkdownTabsWrapperStyled = styled.div`
    margin-top: 2em;
`;

const NoteMarkdownTabs = forwardRef(({content, canEdit, onContentChange, onTyping}, ref) => {
    const [value, setValue] = useState(content);

    // Debounced content update handler
    const handleContentUpdate = useCallback((newContent) => {
        onContentChange(newContent);
    }, [onContentChange]);

    const debouncedContentUpdate = useDebounce(handleContentUpdate, 300);

    useImperativeHandle(ref, () => ({
        resetContent: (content) => {
            setValue(content);
        }
    }), []);

    // Editor change handlers
    const handleOnChange = useCallback((newValue) => {
        setValue(newValue);
        onTyping?.();
    }, []);

    const handleOnKeyUp = useCallback(() => {
        debouncedContentUpdate(value);
    }, [debouncedContentUpdate]);

    // Memoized content and tabs configuration
    const memoizedContent = useMemo(() => value, [value]);

    const tabs = useMemo(() => [
        ...(canEdit ? [
            {
                title: 'Editor',
                icon: <HiOutlineWrenchScrewdriver/>,
                content: <EditorTab
                    content={memoizedContent}
                    onChange={handleOnChange}
                    onKeyUp={handleOnKeyUp}
                />
            }
        ] : []),
        {
            title: 'Preview',
            icon: <FaBookOpenReader/>,
            content: <PreviewTab content={memoizedContent}/>
        },
    ], [memoizedContent, handleOnChange, handleOnKeyUp, canEdit]);

    return (
        <NoteMarkdownTabsWrapperStyled>
            <DynamicTabs tabs={tabs}/>
        </NoteMarkdownTabsWrapperStyled>
    );
});

export default React.memo(NoteMarkdownTabs);
