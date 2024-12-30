import React, {useState, useMemo, useCallback, useEffect} from "react";
import styled from "styled-components";
import MarkdownEditor from "@uiw/react-markdown-editor";
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-editor/markdown-editor.css';
import { debounce } from 'lodash';
import DynamicTabs from "../common/DynamicTabs";
import '../../styles/customMarkdownEditor.css';

const PreviewStyled = styled(MarkdownPreview)`
    text-align: left;
    padding: 1em 2em;
    font-size: 1em;
    font-weight: 600;
    color: var(--color-text);
`;

const EditorStyled = styled(MarkdownEditor)`
    font-size: 1em;
    font-weight: 600;
`;

const NoteMarkdownTabs = React.memo(function MarkdownTabs({ content, onContentChange}) {
    const [tabIndex, setTabIndex] = useState(1);

    const onTabChange = useCallback((index) => {
        setTabIndex(index);
    }, []);

    useEffect(() => {
        setTabIndex(0)
    }, []);

    const handleChange = useMemo(
        () => debounce((newContent) => {
            onContentChange(newContent);
        }, 500),
        [onContentChange]
    );

    const memoizedContent = useMemo(() => content, [content]);

    const tabsData = useMemo(() => [
        {
            title: 'Preview',
            content: tabIndex === 0 ? <PreviewStyled source={memoizedContent} /> : null
        },
        {
            title: 'Editor',
            content: <EditorStyled value={memoizedContent}
                                   onChange={handleChange}
                                   enablePreview={false}/>
        }
    ], [tabIndex, memoizedContent]);

    return (
        <DynamicTabs
            tabsData={tabsData}
            tabIndex={tabIndex}
            onTabChange={onTabChange}
        />
    );
});

export default NoteMarkdownTabs;
