import React, {useCallback} from 'react';
import styled from 'styled-components';
import NoteHeader from "./NoteHeader";
import EditableTitle from "../title/EditableTitle";
import EditableTags from "../tags/EditableTags";
import NoteMarkdownTabs from "../noteMarkdownTabs/NoteMarkdownTabs";
import TypingIndicatorsPopUp from "@/components/note/TypingIndicatorsPopUp";
import {useNoteContext, useNoteSelector} from "@/components/note/hooks/useNoteContext";
import {useNoteTyping} from "./hooks/useNoteTyping"
import {ContainerStyles} from "./styles";

const MainContentContainerStyles = styled(ContainerStyles)`
    grid-area: main_content;
`;

const MainContent = ({headerActions, isMobile, markdownTabsRef}) => {
    const {actions, selectors} = useNoteContext();
    const {editMode} = useNoteSelector(selectors.getStatus);
    const {current} = useNoteSelector(selectors.getContent);
    const owner = useNoteSelector(selectors.getOwner);

    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);
    const {id} = useNoteSelector(selectors.getMeta);
    const {typingUsers, onUserTyping} = useNoteTyping({noteId: id})

    return (
        <MainContentContainerStyles>
            <NoteHeader actions={headerActions} isMobile={isMobile}/>

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
                onTyping={onUserTyping}
                onContentChange={useCallback((content) => actions.updateContent({content}), [actions.updateContent])}
                canEdit={editMode && canEdit}
            />

            <TypingIndicatorsPopUp users={typingUsers} noteOwnerId={owner?.id}/>
        </MainContentContainerStyles>
    );
};

export default React.memo(MainContent);
