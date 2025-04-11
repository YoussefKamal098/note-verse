import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import MarkdownEditor from "@uiw/react-markdown-editor";
import MarkdownPreview from "@uiw/react-markdown-preview";
import '@uiw/react-markdown-editor/markdown-editor.css';
import {debounce} from 'lodash';
import {HiOutlineWrenchScrewdriver} from "react-icons/hi2";
import {FaBookOpenReader} from "react-icons/fa6";
import DynamicTabs from "../dynamicTabs/DynamicTabs";
import '../../styles/customMarkdownEditor.css';

const NoteMarkdownTabsWrapperStyled = styled.div`
    margin-top: 2em;
`

const PreviewStyled = styled(MarkdownPreview)`
    text-align: left;
    padding: 1em 2em 3em;
    font-size: 1em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const EditorStyled = styled(MarkdownEditor)`
    font-size: 0.9em !important;
    font-family: "Poppins", sans-serif !important;
    font-weight: 700 !important;
`;

const NoteMarkdownTabs = ({content, onContentChange, edit = true}) => {
    const [value, setValue] = useState(content);

    useEffect(() => {
        handleOnChange(content);
    }, [content]);

    const debounceChange = useMemo(
        () => debounce((newContent = "") => {
            onContentChange(newContent);
        }, 300), [onContentChange]);

    const handleOnChange = (newValue = "") => {
        setValue(newValue);
    };

    const handleOnKeyUp = () => {
        debounceChange(value);
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
                onPaste={handleOnKeyUp}
                enablePreview={false}
            />
        }
    ], [value]);

    if (!edit) {
        return (
            <NoteMarkdownTabsWrapperStyled>
                <PreviewStyled source={memoizedContent}/>
            </NoteMarkdownTabsWrapperStyled>
        );
    }

    return (
        <NoteMarkdownTabsWrapperStyled>
            <DynamicTabs tabs={tabs}/>
        </NoteMarkdownTabsWrapperStyled>
    );
};

export default React.memo(NoteMarkdownTabs);
