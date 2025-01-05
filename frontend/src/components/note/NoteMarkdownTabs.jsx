import React, {useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import MarkdownEditor from "@uiw/react-markdown-editor";
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-editor/markdown-editor.css';
import {debounce} from 'lodash';
import {HiOutlineWrenchScrewdriver} from "react-icons/hi2";
import {FaBookOpenReader} from "react-icons/fa6";
import DynamicTabs from "../dynamicTabs/DynamicTabs";
import '../../styles/customMarkdownEditor.css';

const PreviewStyled = styled(MarkdownPreview)`
    text-align: left;
    padding: 1em 2em;
    font-size: 1em;
    font-weight: 600;
`;

const EditorStyled = styled(MarkdownEditor)`
    font-size: 1em;
    font-weight: 600;
`;

const NoteMarkdownTabs = React.memo(function MarkdownTabs({content = "", onContentChange}) {
    const initialTabIndex = Number(localStorage.getItem("NoteMarkdownTabsCurrentTab")) || 0;
    const [value, setValue] = useState(content);
    const isValueFromInSite = useRef(false);

    useEffect(() => {
        if (!isValueFromInSite.current) {
            handleOnChange(content);
        }
    }, [content]);

    const onTabChange = (tab) => {
        localStorage.setItem("NoteMarkdownTabsCurrentTab", tab);
    }

    const debounceChange = useMemo(
        () => debounce((newContent = "") => {
            isValueFromInSite.current = true;
            onContentChange(newContent);
        }, 300), [onContentChange]
    );

    const handleOnChange = useMemo(
        () => debounce((newValue = "") => {
            setValue(newValue);
        }, 300), [onContentChange]
    );

    const handleOnKeyUp = () => {
        debounceChange(value)
    };

    const memoizedContent = useMemo(() => value, [value]);

    const tabs = useMemo(() => [
        {
            title: 'Preview',
            icon: <FaBookOpenReader/>,
            content: <PreviewStyled source={memoizedContent}/>
        },
        {
            title: 'Editor',
            icon: <HiOutlineWrenchScrewdriver/>,
            content: <EditorStyled
                value={memoizedContent}
                onChange={handleOnChange}
                onKeyUp={handleOnKeyUp}
                enablePreview={false}
            />
        }
    ], [value]);

    return (<DynamicTabs tabs={tabs} initialTabIndex={initialTabIndex} onTabChange={onTabChange}/>);
});

export default NoteMarkdownTabs;
