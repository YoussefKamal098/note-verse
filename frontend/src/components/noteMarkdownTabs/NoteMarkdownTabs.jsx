import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import {HiOutlineWrenchScrewdriver} from "react-icons/hi2";
import {FaBookOpenReader} from "react-icons/fa6";
import useDebounce from "../../hooks/useDebounce";
import DynamicTabs from "../dynamicTabs/DynamicTabs";
import PreviewTab from "./PreviewTab";
import EditorTab from "./EditorTab";
import '../../styles/customMarkdownEditor.css';

const NoteMarkdownTabsWrapperStyled = styled.div`
    margin-top: 2em;
`;

const NoteMarkdownTabs = ({content, onContentChange}) => {
    const [value, setValue] = useState(content);
    const isValueFromInside = useRef(false);

    // Debounced content update handler
    const handleContentUpdate = useCallback((newContent) => {
        isValueFromInside.current = true;
        onContentChange(newContent);
    }, [onContentChange]);

    const debouncedContentUpdate = useDebounce(handleContentUpdate, 300);

    // Sync external content changes
    useEffect(() => {
        if (isValueFromInside.current) {
            isValueFromInside.current = false;
            return;
        }

        setValue(content);
    }, [content]);

    // Editor change handlers
    const handleOnChange = (newValue) => {
        setValue(newValue);
    };

    const handleOnKeyUp = () => {
        debouncedContentUpdate(value);
    };

    // Memoized content and tabs configuration
    const memoizedContent = useMemo(() => value, [value]);

    const tabs = useMemo(() => [
        {
            title: 'Preview',
            icon: <FaBookOpenReader/>,
            content: <PreviewTab content={memoizedContent}/>
        },
        {
            title: 'Editor',
            icon: <HiOutlineWrenchScrewdriver/>,
            content: <EditorTab
                content={memoizedContent}
                onChange={handleOnChange}
                onKeyUp={handleOnKeyUp}
            />
        }
    ], [memoizedContent, handleOnChange, handleOnKeyUp]);

    return (
        <NoteMarkdownTabsWrapperStyled>
            <DynamicTabs tabs={tabs}/>
        </NoteMarkdownTabsWrapperStyled>
    );
};

export default React.memo(NoteMarkdownTabs);
