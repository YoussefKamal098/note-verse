import React, {useCallback} from 'react';
import styled from 'styled-components';
import NoteHeader from "./NoteHeader";
import EditableTitle from "../title/EditableTitle";
import EditableTags from "../tags/EditableTags";
import NoteMarkdownTabs from "../noteMarkdownTabs/NoteMarkdownTabs";
import {ContainerStyles} from "./styles";
import {useNoteContext, useNoteSelector} from "@/components/note/hooks/useNoteContext";

const MainContentContainerStyles = styled(ContainerStyles)`
    grid-area: main_content;
`;

const MainContent = ({headerActions, markdownTabsRef}) => {
    const {actions, selectors} = useNoteContext();
    const {editMode, isNew} = useNoteSelector(selectors.getStatus);
    const {current} = useNoteSelector(selectors.getContent);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);

    return (
        <MainContentContainerStyles $showTop={!isNew && !editMode}>
            <NoteHeader actions={headerActions}/>

            <EditableTitle
                title={current.title}
                onSave={useCallback((title) => actions.updateContent({title}), [actions.updateContent])}
                canEdit={editMode && canEdit}
            />

            <EditableTags
                tags={current.tags}
                onSave={useCallback((tags) => actions.updateContent({tags}), [actions.updateContent])}
                canEdit={editMode && isOwner}
            />

            <NoteMarkdownTabs
                ref={markdownTabsRef}
                content={current.content}
                onContentChange={useCallback((content) => actions.updateContent({content}), [actions.updateContent])}
                canEdit={editMode && isOwner}
            />
        </MainContentContainerStyles>
    );
};

export default React.memo(MainContent);
